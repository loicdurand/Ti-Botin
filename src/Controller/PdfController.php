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

class PdfController extends AbstractController
{

    /**
     * @Route("/pdf/filer") 
     */
    public function filer()
    {
        return new response();
    }

    #[Route('/html', name: 'export_html')]
    public function html(EntityManagerInterface $manager)
    {
        $interface = "web";

        $unites = $manager->getRepository(Unite::class)->findAll();

        return $this->render('pdf/index.html.twig', [
            'interface' => $interface,
            'title' => "ANNUAIRE COMGENDGP",
            'unites' => $unites
        ]);
    }

    #[Route('/pdf', name: 'export_pdf')]
    public function pdf(EntityManagerInterface $manager)
    {
        $interface = "pdf";

        $unites = $manager->getRepository(Unite::class)->findAll();

        // Configure Dompdf according to your needs
        $pdfOptions = new Options();
        $pdfOptions->set('isRemoteEnabled', true);
        $pdfOptions->set('defaultFont', 'Arial');

        // Instantiate Dompdf with our options
        $dompdf = new Dompdf($pdfOptions);

        // Retrieve the HTML generated in our twig file
        $html = $this->renderView('pdf/index.html.twig', [
            'interface' => $interface,
            'title' => "ANNUAIRE COMGENDGP",
            'unites' => $unites
        ]);

        // Load HTML to Dompdf
        $dompdf->loadHtml($html);

        // (Optional) Setup the paper size and orientation 'portrait' or 'landscape'
        $dompdf->setPaper('A4', 'landscape');

        // Render the HTML as PDF
        $dompdf->render();

        // Output the generated PDF to Browser (inline view)
        $dompdf->stream("Annuaire COMGENDGP.pdf", [
            "Attachment" => true
        ]);
    }

    #[Route('/addgeo', name: 'export_addgeo')]
    public function addgeo(EntityManagerInterface $manager)
    {
        $interface = "web";

        $unites = $manager->getRepository(Unite::class)->findAll();

        $apiBaseUrl = 'https://api-adresse.data.gouv.fr/search/?q=';
        $limit = 1;  // Un résultat max par adresse

        foreach ($unites as $unite) {

            $adresse = $unite->getGeoAddress();

            if (is_null($adresse))
                continue;

            $exists = $manager->getRepository(Adresse::class)->findOneBy(['geoAddress' => $adresse]);

            if (!is_null($exists)) {
                $unite->setAdresse($exists);
                $manager->persist($unite);
                $manager->flush();
                continue;
            }

            $lines = explode('$', $adresse);
            $cp_commune = array_pop($lines);
            $array_cp_commune = explode(' ', $cp_commune, 2);

            if (count($array_cp_commune) <= 1)
                continue;

            [$cp, $commune] = $array_cp_commune;

            $adr = new Adresse();
            $adr->setGeoAddress($adresse);
            foreach ($lines as $i => $line)
                $adr->{'setLigne' . ($i + 1)}($line);

            $adr->setCodePostal($cp);
            $adr->setCommune($commune);


            //echo "Traitement de l'adresse $index : $adresse\n";

            // Équivalent fetch() : cURL pour GET
            $url = $apiBaseUrl . urlencode($adresse) . "&limit=$limit";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);  // 10s max
            curl_setopt($ch, CURLOPT_USERAGENT, 'Ti-Botin/1.0');  // Poli pour l'API

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode !== 200 || $response === false) {
                //echo "Erreur API pour $adresse (code $httpCode) : skip\n";
                continue;
            }

            // Parsing JSON (équivalent response.json() en JS)
            $data = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE || !isset($data['features'][0])) {
                //echo "Pas de résultat valide pour $adresse : skip\n";
                continue;
            }

            $feature = $data['features'][0];
            $lng = $feature['geometry']['coordinates'][0];  // Longitude d'abord
            $lat = $feature['geometry']['coordinates'][1];  // Puis latitude

            // Insertion en BDD
            $adr->setLng($lng);
            $adr->setLat($lat);
            $unite->setAdresse($adr);
            $manager->persist($unite);
            $manager->flush();

            //echo "Inséré : $adresse -> Lat: $lat, Lon: $lon\n";

            // Pause pour respecter les limites (50/sec → ~1s pause safe)
            sleep(1);
        }

        return $this->render('pdf/index.html.twig', [
            'interface' => $interface,
            'title' => "ANNUAIRE COMGENDGP",
            'unites' => $unites
        ]);
    }

    private function base64(string $path)
    {
        return 'data:image/jpeg;base64,' . base64_encode(file_get_contents($path));
    }
}
