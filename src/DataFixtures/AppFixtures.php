<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\Ldap\Ldap;
use Symfony\Component\Ldap\Exception\ConnectionException;
use Symfony\Component\Ldap\Exception\LdapException;
use App\Entity\Unite;
use App\Entity\User;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $ldap_unites = $this->getAllGroups();

        foreach ($ldap_unites as $unite) {
            $unt = new Unite();
            $unt->setCode($unite->getAttribute('codeUnite')[0]);
            $unt->setName($unite->getAttribute('businessOu')[0]);
            $unt->setGeoAddress(is_null($unite->getAttribute('geoAddress')) ? "" : $unite->getAttribute('geoAddress')[0]);
            $unt->setPostalCode(is_null($unite->getAttribute('postalCode')) ? null : $unite->getAttribute('postalCode')[0]);
            // Autres champs
            $unt->setCn(is_null($unite->getAttribute('cn')) ? "" : $unite->getAttribute('cn')[0]);
            $unt->setSubdivision(is_null($unite->getAttribute('subdivision')) ? "" : $unite->getAttribute('subdivision')[0]);
            $unt->setTelephoneNumber(is_null($unite->getAttribute('telephoneNumber')) ? "" : $unite->getAttribute('telephonenumber')[0]);
            $unt->setMail(is_null($unite->getAttribute('mail')) ? "" : $unite->getAttribute('mail')[0]);
            $unt->setL(is_null($unite->getAttribute('l')) ? "" : $unite->getAttribute('l')[0]);
            $unt->setPostalAddress(is_null($unite->getAttribute('postalAddress')) ? "" : $unite->getAttribute('postalAddress')[0]);
            $unt->setCapaciteJudiciaire(is_null($unite->getAttribute('capaciteJudiciaire')) ? "" : $unite->getAttribute('capaciteJudiciaire')[0]);
            $unt->setGeoAddress(is_null($unite->getAttribute('geoAddress')) ? "" : $unite->getAttribute('geoAddress')[0]);
            $unt->setDepartmentUID(is_null($unite->getAttribute('departmentUID')) ? "" : $unite->getAttribute('departmentUID')[0]);
            $unt->setParentDepartmentUID(is_null($unite->getAttribute('parentDepartmentUID')) ? "" : $unite->getAttribute('parentDepartmentUID')[0]);

            $manager->persist($unt);
            $manager->flush();
        }

        $unites = $manager->getRepository(Unite::class)->findAll();

        $sum = 0;

        foreach ($unites as $unite) {
            $ldap_users = $this->getUsersByUnite($unite->getCode());
            $count = count($ldap_users);
            if ($count === 0)
                continue;
            $sum += $count;
            echo $count . " personnels trouvés dans l'unité " . $unite->getName() . "\n";
            foreach ($ldap_users as $usr) {

                $user = new User();
                $user->setFonction(is_null($usr->getAttribute('responsabilite')) ? "" : $usr->getAttribute('responsabilite')[0])
                    ->setGrade(is_null($usr->getAttribute('title')) ? "" : $usr->getAttribute('title')[0])
                    ->setNom(is_null($usr->getAttribute('sn')) ? "" : $usr->getAttribute('sn')[0])
                    ->setPrenom(is_null($usr->getAttribute('givenName')) ? "" : $usr->getAttribute('givenName')[0])
                    ->setSpecificite(is_null($usr->getAttribute('specialite')) ? "" : $usr->getAttribute('specialite')[0])
                    ->setQualification(is_null($usr->getAttribute('qualification')) ? "" : $usr->getAttribute('qualification')[0])
                    ->setTph(is_null($usr->getAttribute('telephoneNumber')) ? "" : $usr->getAttribute('telephoneNumber')[0])
                    ->setPort(is_null($usr->getAttribute('telephoneNEO')) ? "" : $usr->getAttribute('telephoneNEO')[0])
                    ->setMail(is_null($usr->getAttribute('mail')) ? "" : $usr->getAttribute('mail')[0])
                    ->setUnite($unite)
                    // Autres champs
                    ->setPositionAdministrative(is_null($usr->getAttribute('positionAdministrative')) ? "" : $usr->getAttribute('positionAdministrative')[0])
                    ->setAccountStatus(is_null($usr->getAttribute('accountStatus')) ? "" : $usr->getAttribute('accountStatus')[0])
                    ->setCivilite(is_null($usr->getAttribute('civilite')) ? "" : $usr->getAttribute('civilite')[0])
                    ->setEmployeeType(is_null($usr->getAttribute('employeeType')) ? "" : $usr->getAttribute('employeeType')[0])
                    ->setGradeLong(is_null($usr->getAttribute('rank')) ? "" : $usr->getAttribute('rank')[0])
                    ->setStatutCorps(is_null($usr->getAttribute('statutCorps')) ? "" : $usr->getAttribute('statutCorps')[0]);

                $manager->persist($user);
            }

            $manager->flush();
        }

        $manager->flush();
        echo "\n" . $sum . " personnels trouvés au sein du COMGEND";
    }

    private function getAllGroups(): array
    {
        try {
            // Créer la connexion LDAP
            $ldap = Ldap::create('ext_ldap', [
                'connection_string' => 'ldap://' . $_ENV['LDAP_HOST'] . ':' . $_ENV['LDAP_PORT'],
            ]);

            // Bind avec l'utilisateur admin
            if ($_ENV['APP_ENV'] === 'dev')
                $ldap->bind('cn=' . $_ENV['LDAP_USER'] . ',ou=people,' . $_ENV['BASE_DN'], $_ENV['LDAP_PASSWORD']);
            else
                $ldap->bind(null, null);

            // Construire le filtre (ajusté pour LLDAP)
            $filter = "(&(objectclass=organizationalUnit)(memberOf=cn=g_tu-fo_12609,dmdName=Groupes,dc=gendarmerie,dc=defense,dc=gouv,dc=fr))"; //departmentNumber=GEND/COMGENDGP))";

            // Exécution de la requête
            $query = $ldap->query($_ENV['BASE_DN'], $filter, [
                'filter' => [
                    'codeUnite',
                    'businessOu',
                    'geoAddress',
                    'postalCode',
                    'cn',
                    'subdivision',
                    'telephoneNumber',
                    'mail',
                    'l',
                    'postalAddress',
                    'capaciteJudiciaire',
                    'departmentUID',
                    'parentDepartmentUID'
                ],
                //'scope' => 'sub',
            ]);

            $results = $query->execute()->toArray();


            return $results;
        } catch (ConnectionException $e) {
            //         // Erreur de connexion au serveur LDAP
            throw new \Exception('Erreur de connexion LDAP : ' . $e->getMessage());
        } catch (LdapException $e) {
            //         // Erreur lors de la requête ou du bind
            throw new \Exception('Erreur LDAP : ' . $e->getMessage());
        } catch (\Exception $e) {
            //         // Autres erreurs
            throw new \Exception('Erreur générale : ' . $e->getMessage());
        }
    }

    private function getUsersByUnite(int $code): array
    {
        try {
            // Créer la connexion LDAP
            $ldap = Ldap::create('ext_ldap', [
                'connection_string' => 'ldap://' . $_ENV['LDAP_HOST'] . ':' . $_ENV['LDAP_PORT'],
            ]);

            // Bind avec l'utilisateur admin
            if ($_ENV['APP_ENV'] === 'dev')
                $ldap->bind('cn=' . $_ENV['LDAP_USER'] . ',ou=people,' . $_ENV['BASE_DN'], $_ENV['LDAP_PASSWORD']);
            else
                $ldap->bind(null, null);

            // Construire le filtre (ajusté pour LLDAP)
            $filter = '(objectClass=person)';

            if ($_ENV['APP_ENV'] === 'dev')
                $filter = sprintf('(&(objectClass=person)(codeunite=%s))', $ldap->escape($code, '', LDAP_ESCAPE_FILTER));
            else
                $filter = sprintf('(&(objectClass=person)(codeUnite=%s))', $ldap->escape($code, '', LDAP_ESCAPE_FILTER));
            // Exécution de la requête
            $query = $ldap->query($_ENV['BASE_DN'], $filter, [
                //'filter' => ['codeUnite', 'businessOu'], // Ne récupérer que le DN pour compter
                //'scope' => 'sub',
            ]);

            $results = $query->execute()->toArray();

            return $results;
        } catch (ConnectionException $e) {
            //         // Erreur de connexion au serveur LDAP
            throw new \Exception('Erreur de connexion LDAP : ' . $e->getMessage());
        } catch (LdapException $e) {
            //         // Erreur lors de la requête ou du bind
            throw new \Exception('Erreur LDAP : ' . $e->getMessage());
        } catch (\Exception $e) {
            //         // Autres erreurs
            throw new \Exception('Erreur générale : ' . $e->getMessage());
        }
    }
}
