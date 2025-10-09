<?php

namespace App\Repository;

use App\Entity\Unite;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Unite>
 */
class UniteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Unite::class);
    }

    public function getDistinctUnitesTypes()
    {
        $results = [];
        $unites = $this->createQueryBuilder('u')
            ->select('u.name')
            ->getQuery()
            ->getResult();
        foreach ($unites as $data) {
            [$term,] = preg_split("/[\s,\-]+/", $data['name']);
            // foreach ($terms as $term) {
            if (!in_array($term, $results))
                $results[] = $term;
            // }
        }
        return $results;
    }

    public function findByIdentifier($term, $city)
    {

        $query = $this->createQueryBuilder('un')
            ->select('un.code, un.name, adr.lat, adr.lng, un.name as label ')
            ->innerJoin('un.adresse', 'adr')
            ->andWhere("un.name LIKE :name")
            ->setParameter('name', $term . '%');
        if (!is_null($city)) {
            $query
                ->andWhere("adr.commune = :city")
                ->setParameter('city', $city);
        }
        $unites = $query
            ->getQuery()
            ->getResult();

        return $unites;
    }

    //    /**
    //     * @return Unite[] Returns an array of Unite objects
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

    //    public function findOneBySomeField($value): ?Unite
    //    {
    //        return $this->createQueryBuilder('u')
    //            ->andWhere('u.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
