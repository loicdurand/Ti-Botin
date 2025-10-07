<?php
// src/Controller/IndexController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;

use App\Entity\Unite;
use App\Entity\Adresse;

class ApiController extends AbstractController
{

    #[Route('/api/adresses', name: 'export_api_adresses')]
    public function api_adresses(EntityManagerInterface $manager)
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
    public function api_adresse(EntityManagerInterface $manager, string $adresse_id)
    {
        $output = [];
        $unites = $manager->getRepository(Unite::class)->findBy(['adresse' => $adresse_id]);
        foreach ($unites as $unite) {
            $output[] = [
                'id' => $unite->getId(),
                'code' => $unite->getCode(),
                'name' => $unite->getName()
            ];
        }
        return $this->json($output);
    }
}
