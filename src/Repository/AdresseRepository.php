<?php

namespace App\Repository;

use App\Entity\Adresse;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Adresse>
 */
class AdresseRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Adresse::class);
    }

    public function getDistinctCommunes()
    {
        $results = [];
        $communes = $this->createQueryBuilder('a')
            ->select('a.commune')
            ->getQuery()
            ->getResult();
        foreach ($communes as $data) {
            $terms = preg_split("/\s/", strtolower($data['commune']));
            $exclus = ['le', 'la', 'les', 'l', 'd', 'de', 'des'];
            foreach ($terms as $term) {
                if (!in_array($term, $exclus) && !in_array($term, $results))
                    $results[] = $term;
            }
        }
        return $results;
    }

    public function getCommunesAlias()
    {
        return $this->createQueryBuilder('a')
            ->select('a.commune, a.aliasses')
            ->andWhere('a.aliasses IS NOT NULL')
            ->getQuery()
            ->getResult();
    }

    //    /**
    //     * @return Adresse[] Returns an array of Adresse objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('a')
    //            ->andWhere('a.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('a.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?Adresse
    //    {
    //        return $this->createQueryBuilder('a')
    //            ->andWhere('a.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
