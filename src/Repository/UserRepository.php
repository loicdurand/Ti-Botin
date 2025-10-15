<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\DBAL\Connection;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository
{
    private Connection $connection;
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
        $this->connection = $this->getEntityManager()->getConnection();
    }

    public function getDistinctPrenoms()
    {
        $results = [];
        $prenoms = $this->createQueryBuilder('u')
            ->select('DISTINCT u.prenom')
            ->getQuery()
            ->getResult();

        foreach ($prenoms as $data) {
            $results[] = $data['prenom'];
        }
        return $results;
    }

    public function getDistinctNoms()
    {
        $results = [];
        $prenoms = $this->createQueryBuilder('u')
            ->select('DISTINCT u.nom')
            ->getQuery()
            ->getResult();

        foreach ($prenoms as $data) {
            $results[] = $data['nom'];
        }
        return $results;
    }

    public function findByIdentity($term)
    {
        $split = explode(' ', $term, 2);
        $prenom = $split[0];
        $nom = count($split) > 1 ? $split[1] : null;

        $query = $this->createQueryBuilder('u')
            ->select('un.code as code_unite, un.name as unite, u.id, u.nigend, u.fonction, u.grade, u.prenom, u.nom, u.specificite, u.qualification, u.grade_long, u.statutCorps as statut_corps, u.tph, u.port, u.mail, u.qualification')
            ->innerJoin('u.unite', 'un');
        if ($prenom !== '#') {
            $query
                ->andWhere("u.prenom = :prenom OR u.nom = :prenom")
                ->setParameter('prenom', $prenom);
        }

        if (!is_null($nom)) {
            $query
                // ->andWhere("u.nom LIKE :nom")
                ->orWhere("CONCAT(u.prenom, ' ', u.nom) LIKE :nom")
                ->setParameter('nom', $prenom . '%' . $nom . '%');
            // ->setParameter('term', $term);
        }
        $persons = $query
            ->getQuery()
            ->getResult();

        if (count($persons) == 0)
            return $this->findByIdentity('# ' . $term);

        return $persons;
    }

    public function findByPhoneOrNigend($numeroNettoye)
    {
        $sql = "
            SELECT 
            CASE
                WHEN (
                    REPLACE(REPLACE(u.tph, ' ', ''), '+', '') LIKE :suffixe
                    AND 
                    REPLACE(REPLACE(u.tph, ' ', ''), '+', '') != REPLACE(REPLACE(un.telephone_number, ' ', ''), '+', '')
                ) THEN 'tph'
                WHEN REPLACE(REPLACE(u.port, ' ', ''), '+', '') LIKE :suffixe THEN 'port'
                ELSE 'other'
            END AS found_column,
            un.code as code_unite, un.name as unite, u.id, u.nigend, u.fonction, u.grade, u.prenom, u.nom, u.specificite, u.qualification, u.grade_long, u.statut_corps, u.tph, u.port, u.mail, u.qualification 
            FROM user u
            INNER JOIN unite un ON u.unite_id = un.id 
            WHERE (
                REPLACE(REPLACE(u.tph, ' ', ''), '+', '') LIKE :suffixe
                AND 
                REPLACE(REPLACE(u.tph, ' ', ''), '+', '') != REPLACE(REPLACE(un.telephone_number, ' ', ''), '+', '')
            )
            OR REPLACE(REPLACE(u.port, ' ', ''), '+', '') LIKE :suffixe
            OR nigend = :nigend
        ";

        $resultSet = $this->connection->executeQuery($sql, ['suffixe' => "%$numeroNettoye", 'nigend' => $numeroNettoye]); // . $numeroNettoye]);

        // returns an array of arrays (i.e. a raw data set)
        return $resultSet->fetchAllAssociative();
    }

    public function findByFonction($term, $city, $cdt_words)
    {
        $c1 = in_array("cdu", $cdt_words);

        $query = $this->createQueryBuilder('u')
            ->select('un.code as code_unite, un.name as unite, u.id, u.nigend, u.fonction, u.grade, u.prenom, u.nom, u.specificite, u.qualification, u.grade_long, u.statutCorps as statut_corps, u.tph, u.port, u.mail, u.qualification')
            ->innerJoin('u.unite', 'un')
            ->innerJoin('un.adresse', 'adr')
            ->andWhere("un.name LIKE :term AND u.fonction = :fonction")
            ->setParameter('term', $term . '%')
            ->setParameter('fonction', $c1 ? 'C' : 'A');
        if (!is_null($city)) {
            $query
                ->andWhere("adr.commune = :city")
                ->setParameter('city', $city);
        }

        $persons = $query
            ->getQuery()
            ->getResult();

        return $persons;
    }

    public function findListeOf($code_unite, $liste)
    {
        /*
         Ex: $liste = [
            'tous' => ['liste', 'list', 'tableau', 'table', 'personnels'],
            'statut' => ['militaires', 'civils'],
            'qualification' => ['opj', 'apj', 'apja']
        ]
         */

        $query = $this->createQueryBuilder('u')
            ->select('un.code as code_unite, un.name as unite, u.id, u.nigend, u.fonction, u.grade, u.prenom, u.nom, u.specificite, u.qualification, u.grade_long, u.statutCorps as statut_corps, u.tph, u.port, u.mail, u.qualification')
            ->innerJoin('u.unite', 'un')
            ->andWhere("un.code = :code")
            ->setParameter('code', $code_unite);

        if (!empty($liste['statut'])) {
            $statut = $liste['statut'];
            $query->andWhere("LOWER(u.statutCorps) IN (:statut)")
                ->setParameter('statut', implode(',', $statut));
        }

        if (!empty($liste['qualification'])) {
            $qualification = $liste['qualification'];
            $query->andWhere("LOWER(u.qualification) IN (:qualification)")
                ->setParameter('qualification', implode(',', $qualification));
        }

        $persons = $query
            ->getQuery()
            ->getResult();

        return $persons;
    }
}
