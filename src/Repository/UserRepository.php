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
            ->select('un.code as code_unite, un.name as unite, u.id, u.fonction, u.grade, u.prenom, u.nom, u.specificite, u.qualification, u.grade_long, u.statutCorps as statut_corps, u.tph, u.port, u.mail, u.qualification')
            ->innerJoin('u.unite', 'un');
        if ($prenom !== '#') {
            $query
                ->andWhere("u.prenom = :prenom")
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

    public function findByPhone($numeroNettoye)
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
            un.code as code_unite, un.name as unite, u.id, u.fonction, u.grade, u.prenom, u.nom, u.specificite, u.qualification, u.grade_long, u.statut_corps, u.tph, u.port, u.mail, u.qualification 
            FROM user u
            INNER JOIN unite un ON u.unite_id = un.id 
            WHERE (
                REPLACE(REPLACE(u.tph, ' ', ''), '+', '') LIKE :suffixe
                AND 
                REPLACE(REPLACE(u.tph, ' ', ''), '+', '') != REPLACE(REPLACE(un.telephone_number, ' ', ''), '+', '')
            )
            OR REPLACE(REPLACE(u.port, ' ', ''), '+', '') LIKE :suffixe
        ";

        $resultSet = $this->connection->executeQuery($sql, ['suffixe' => "%$numeroNettoye"]); // . $numeroNettoye]);

        // returns an array of arrays (i.e. a raw data set)
        return $resultSet->fetchAllAssociative();
    }

    //    /**
    //     * @return User[] Returns an array of User objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('u.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?User
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
