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
        // $output = [];
        $unites = $manager->getRepository(Unite::class)->findByAdresseId($adresse_id);
        return $this->json($unites);
        // $unites = $manager->getRepository(Unite::class)->findBy(['adresse' => $adresse_id]);
        // foreach ($unites as $unite) {
        //     $adr = $unite->getAdresse(); 
        //     $output[] = [
        //         'id' => $unite->getId(),
        //         'code' => $unite->getCode(),
        //         'name' => $unite->getName(),
        //         'lat' => $adr->getLat(),
        //         'lon' => $adr->getLng(),
        //         'label' => count($unites) > 1 ? $adr->getLigne1() : $unites[0]->getName()

        //     ];
        // }
        // return $this->json($output);
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
            $city = $data->city ?? $data->city;
            $number = $data->number ?? $data->number;
            $output = [
                'type' => $type,
                'data' => []
            ];


            if ($type === 'number' && !is_null($number)) {
                // Vu qu'un numéro peut être 6804 ou 31 11 88 ou 31.11.88 ou 311188, on commence par supprimer tout ce qui n'est pas un chiffre
                $cleaned_number = preg_replace('/\D/', '', $number);
                // Si moins de 5 chiffres, c'est probablement un code unité
                if (strlen($cleaned_number) <= 5) {
                    $output['type'] = 'unite';
                    $output['data'] = $manager->getRepository(Unite::class)->findByCodeUnite(intval($cleaned_number));
                }
            } else if ($type === 'person') {
                $output['data'] = $manager->getRepository(User::class)->findByIdentity($term);
            } else if ($type === 'unite') {
                $output['data'] = $manager->getRepository(Unite::class)->findByIdentifier($term, $city);
            }
            return $this->json($output);
            // $attributes = $data['attributes'] ?? null;
        } catch (\Throwable $th) {
            return $this->json([
                'error' => $th
            ]);
        }
    }
}
