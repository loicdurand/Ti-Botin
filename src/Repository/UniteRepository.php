<?php

namespace App\Repository;

use App\Entity\Unite;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\DBAL\Connection;

/**
 * @extends ServiceEntityRepository<Unite>
 */
class UniteRepository extends ServiceEntityRepository
{
    private Connection $connection;
    private const UNITE_FIELDS = 'adr.lng, adr.lat, un.code, un.name, un.cn, adr.lat, adr.lng, un.name as label, un.subdivision, un.capaciteJudiciaire, un.telephoneNumber as tph, un.mail, un.departmentUID as uid, un.parentDepartmentUID as parent';

    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Unite::class);
        $this->connection = $this->getEntityManager()->getConnection();
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

    public function findByAdresseId($adresse_id)
    {
        // 
        return $this->createQueryBuilder('un')
            ->select(self::UNITE_FIELDS)
            ->innerJoin('un.adresse', 'adr')
            ->andWhere("adr.id = :id")
            ->setParameter('id', $adresse_id)
            ->getQuery()
            ->getResult();
    }

    public function findByCodeUnite($cleaned_number)
    {
        return $this->createQueryBuilder('un')
            ->select(self::UNITE_FIELDS)
            ->innerJoin('un.adresse', 'adr')
            ->andWhere("un.code LIKE :CU")
            ->setParameter('CU', $cleaned_number . '%')
            ->getQuery()
            ->getResult();
    }

    public function findByParent($uid)
    {
        return $this->createQueryBuilder('un')
            ->select(self::UNITE_FIELDS)
            ->innerJoin('un.adresse', 'adr')
            ->andWhere("un.parentDepartmentUID LIKE :uid")
            ->setParameter('uid', $uid . '%')
            ->getQuery()
            ->getResult();
    }

    public function findByIdentifier($term, $city)
    {
        $query = $this->createQueryBuilder('un')
            ->select(self::UNITE_FIELDS)
            ->innerJoin('un.adresse', 'adr')
            ->andWhere("LOWER(un.name) LIKE :term")
            ->setParameter('term', $term . '%');
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

    public function findByPhoneOrCodeUnite($numeroNettoye)
    {
        $sql = "
            SELECT 
            CASE
                WHEN REPLACE(REPLACE(un.telephone_number, ' ', ''), '+', '') LIKE :suffixe THEN 'telephone_number'
                WHEN un.code LIKE :suffixe THEN 'code'
                ELSE 'other'
            END AS found_column,
            un.code, un.name, un.cn, adr.lat, adr.lng, un.name as label, un.subdivision, un.capacite_judiciaire, un.telephone_number as tph, un.mail, un.department_uid as uid, un.parent_department_uid as parent
            FROM unite un
            INNER JOIN adresse adr ON un.adresse_id = adr.id 
            WHERE REPLACE(REPLACE(un.telephone_number, ' ', ''), '+', '') LIKE :suffixe
            OR un.code LIKE :suffixe
        ";

        $resultSet = $this->connection->executeQuery($sql, ['suffixe' => "%$numeroNettoye"]); // . $numeroNettoye]);

        // returns an array of arrays (i.e. a raw data set)
        return $resultSet->fetchAllAssociative();
    }
}
