<?php
// src/Controller/IndexController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;

use App\Entity\Adresse;

class ApiController extends AbstractController
{

    #[Route('/api/adresses', name: 'export_api_unites')]
    public function api_adresses(EntityManagerInterface $manager)
    {
        $adresses = $manager->getRepository(Adresse::class)->findAll();

        return $this->json($adresses);
    }
}
