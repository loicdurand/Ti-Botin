<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
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
        $nom = count($split) > 1 ? $split[1] : false;
        $results = [];
        $query = $this->createQueryBuilder('u')
            ->select('un.code as code_unite, un.name as unite, u.id, u.fonction, u.grade, u.prenom, u.nom, u.specificite, u.tph, u.port, u.mail, u.qualification')
            ->innerJoin('u.unite', 'un')
            ->andWhere("u.prenom = :prenom")
            ->setParameter('prenom', $prenom);
        if ($nom !== false) {
            $query
                ->andWhere("u.nom = :nom")
                // ->orWhere("CONCAT(u.prenom, ' ', u.nom) = :term")
                ->setParameter('nom', $nom);
            // ->setParameter('term', $term);
        }
        $persons = $query
            ->getQuery()
            ->getResult();

        // $persons = $this->createQueryBuilder('u')  // Alias 'u' pour User
        //     ->select('u, un')  // Sélectionne les champs de u et un (équivalent à u.*, un.*)
        //     ->innerJoin('u.unite', 'un')  // Jointure sur la relation 'unite' de l'entité User
        //     ->where('u.prenom = :prenom')
        //     ->setParameter('prenom', $prenom)
        //     ->getQuery()
        //     ->getResult();

        return $persons;
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
