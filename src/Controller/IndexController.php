<?php
// src/Controller/IndexController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Doctrine\ORM\EntityManagerInterface;

use App\Entity\Unite;
use App\Entity\User;
use App\Entity\Adresse;

// Include Dompdf required namespaces
use Dompdf\Dompdf;
use Dompdf\Options;

class IndexController extends AbstractController
{

    #[Route('/', name: 'export_index')]
    public function index(EntityManagerInterface $manager)
    {
        return $this->render('index/index.html.twig', []);
    }
}
