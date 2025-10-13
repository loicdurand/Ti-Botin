<?php
// src/Controller/IndexController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;

use App\Entity\User;
use App\Entity\Unite;
use App\Entity\Adresse;

class ApiController extends AbstractController
{

    private $commandement_terms = [
        'cdu' => ['commande', 'commandant', 'cdt', 'c1', 'cc', 'cb', 'ccb', 'cbr', 'cpsig', 'cdu'],
        'adjoint' => ['c2', 'adjoint', 'cba', 'cbra', 'cdua']
    ];

    private $liste_terms = [
        'tous' => ['liste', 'list', 'tableau', 'table', 'personnels'],
        'statut' => ['militaires', 'militaire', 'civils', 'civil'],
        'qualification' => ['opj', 'apj', 'apja']
    ];

    #[Route('/api/adresses', name: 'export_api_adresses')]
    public function api_adresses(EntityManagerInterface $manager): Response
    {
        $output = [];
        $adresses = $manager->getRepository(Adresse::class)->findAll();
        foreach ($adresses as $adr) {
            $unites = $adr->getUnites();
            $output[] = [
                'id' => $adr->getId(),
                'lat' => $adr->getLat(),
                'lng' => $adr->getLng(),
                'label' => count($unites) > 1 ? $adr->getLigne1() : $unites[0]->getName()
            ];
        }

        return $this->json($output);
    }

    #[Route('/api/unite/{adresse_id}', name: 'export_api_adresse')]
    public function api_adresse(EntityManagerInterface $manager, string $adresse_id): Response
    {
        $unites = $manager->getRepository(Unite::class)->findByAdresseId($adresse_id);
        return $this->json($unites);
    }

    #[Route('/api/chat-data', name: 'export_api_chatdata')]
    public function api_chatdata(EntityManagerInterface $manager): Response
    {
        $UserRepo = $manager->getRepository(User::class);
        $adrRepo = $manager->getRepository(Adresse::class);
        $results = [
            'prenoms' => $UserRepo->getDistinctPrenoms(),
            'noms' => $UserRepo->getDistinctNoms(),
            'unites' => $manager->getRepository(Unite::class)->getDistinctUnitesTypes(),
            'communes' => $adrRepo->getDistinctCommunes(),
            'communes_alias'  => $adrRepo->getCommunesAlias(),
            'commandement_terms' => $this->commandement_terms,
            'liste_terms' => $this->liste_terms

        ];
        // dd($results['communes_alias']);
        return $this->json($results);
    }

    #[Route('/api/search', name: 'export_api_search')]
    public function api_search(Request $request, EntityManagerInterface $manager): Response
    {
        $data = $request->query->get('q') ?? $request->request->get('q');
        try {
            $data = json_decode($data);
            $type = $data->type ?? $data->type;
            $term = $data->term ?? $data->term;
            $attributes = $data->attributes ?? $data->attributes;
            $city = $data->city ?? $data->city;
            $output = [
                'type' => $type,
                'data' => []
            ];

            if ($type === 'person') {
                $output['data'] = $manager->getRepository(User::class)->findByIdentity($term);
            } else if ($type === 'unite') {

                // si recherche du type "qui commande, qui est l'adjoint, etc.."
                if (count($attributes)) {
                    $cdt_words = [];
                    foreach ($this->commandement_terms as $fonction_type => $words) {
                        foreach ($words as $word) {
                            if (in_array($word,  $attributes))
                                $cdt_words[] = $fonction_type;
                        }
                    }
                    $output['type'] = 'person';
                    $output['data'] = $manager->getRepository(User::class)->findByFonction($term, $city, $cdt_words);
                } else {
                    $output['data'] = $manager->getRepository(Unite::class)->findByIdentifier($term, $city);
                }
            }
            return $this->json($output);
        } catch (\Throwable $th) {
            return $this->json([
                'error' => $th
            ]);
        }
    }

    #[Route('/api/find-by-number', name: 'export_api_find_by_number')]
    public function api_find_by_number(Request $request, EntityManagerInterface $manager): Response
    {
        $output = [];
        $data = $request->query->get('q') ?? $request->request->get('q');
        try {
            $data = json_decode($data);
            $numeroNettoye = $data->number ? $this->nettoyerTelephone($data->number) : 'Z';

            $numeroNettoye = strlen($numeroNettoye) > 8 ? substr($numeroNettoye, -9) : $numeroNettoye;

            $output[] = [
                // 'person' => $manager->getRepository(User::class)->findByPhoneOrNigend($formatted_number, intval($cleaned_number)),
                'type' => 'unite',
                'data' => $manager->getRepository(Unite::class)->findByPhoneOrCodeUnite($numeroNettoye)
            ];
            $output[] = [
                // 'person' => $manager->getRepository(User::class)->findByPhoneOrNigend($formatted_number, intval($cleaned_number)),
                'type' => 'person',
                'data' => $manager->getRepository(User::class)->findByPhone($numeroNettoye)
            ];
            return $this->json($output);
        } catch (\Throwable $th) {
            return $this->json([
                'error' => $th
            ]);
        }
    }

    #[Route('/api/get-list-of', name: 'export_api_getlistof')]
    public function api_getlistof(Request $request, EntityManagerInterface $manager): Response
    {
        $data = $request->query->get('q') ?? $request->request->get('q');
        // try {
        $data = json_decode($data);
        $type = $data->type ?? $data->type;
        $term = $data->term ?? $data->term;
        $city = $data->city ?? $data->city;
        $liste = $data->liste ?? $data->liste;
        $liste = explode(' ', $data->liste); // Ex: ['liste', 'personnels', 'opj']

        $liste_words = [];
        foreach ($this->liste_terms as $type => $words) {
            foreach ($words as $word) {
                if (in_array($word,  $liste)) {

                    if (!array_key_exists($type, $liste_words))
                        $liste_words[$type] = [];
                    $liste_words[$type][] = $word;
                }
            }
        }


        $unites = $manager->getRepository(Unite::class)->findByIdentifier($term, $city);
        foreach ($unites as $i => $unite) {
            $unites[$i]['users'] = $manager->getRepository(User::class)->findListeOf($unite['code'], $liste_words);
        }

        return $this->json($unites);
        // } catch (\Throwable $th) {
        //     return $this->json([
        //         'error' => $th
        //     ]);
        // }
    }

    private function nettoyerTelephone($telephone)
    {
        return preg_replace('/[^0-9]|\s/', '', $telephone);
    }
}
