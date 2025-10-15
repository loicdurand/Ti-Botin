<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251015194253 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE adresse (id INT AUTO_INCREMENT NOT NULL, ligne1 VARCHAR(50) DEFAULT NULL, ligne2 VARCHAR(50) DEFAULT NULL, ligne3 VARCHAR(50) DEFAULT NULL, code_postal INT NOT NULL, commune VARCHAR(255) NOT NULL, lng VARCHAR(255) DEFAULT NULL, lat VARCHAR(255) DEFAULT NULL, geo_address VARCHAR(255) DEFAULT NULL, aliasses LONGTEXT DEFAULT NULL COMMENT \'(DC2Type:simple_array)\', PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE unite (id INT AUTO_INCREMENT NOT NULL, adresse_id INT DEFAULT NULL, code INT NOT NULL, name VARCHAR(50) NOT NULL, geo_address VARCHAR(255) DEFAULT NULL, postal_code INT DEFAULT NULL, cn VARCHAR(255) DEFAULT NULL, subdivision VARCHAR(255) DEFAULT NULL, telephone_number VARCHAR(20) DEFAULT NULL, mail VARCHAR(255) DEFAULT NULL, l VARCHAR(255) DEFAULT NULL, postal_address VARCHAR(255) DEFAULT NULL, capacite_judiciaire TINYINT(1) DEFAULT NULL, department_uid VARCHAR(255) DEFAULT NULL, parent_department_uid VARCHAR(255) DEFAULT NULL, INDEX IDX_1D64C1184DE7DC5C (adresse_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE `user` (id INT AUTO_INCREMENT NOT NULL, unite_id INT NOT NULL, fonction VARCHAR(50) DEFAULT NULL, grade VARCHAR(30) DEFAULT NULL, nom VARCHAR(50) NOT NULL, prenom VARCHAR(50) NOT NULL, specificite VARCHAR(50) NOT NULL, tph VARCHAR(20) DEFAULT NULL, port VARCHAR(20) DEFAULT NULL, tph_interne VARCHAR(10) DEFAULT NULL, mail VARCHAR(255) DEFAULT NULL, qualification VARCHAR(20) DEFAULT NULL, position_administrative VARCHAR(8) DEFAULT NULL, account_status VARCHAR(20) DEFAULT NULL, civilite VARCHAR(8) DEFAULT NULL, employee_type VARCHAR(20) DEFAULT NULL, grade_long VARCHAR(50) DEFAULT NULL, statut_corps VARCHAR(20) DEFAULT NULL, nigend INT DEFAULT NULL, INDEX IDX_8D93D649EC4A74AB (unite_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', available_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', delivered_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\', INDEX IDX_75EA56E0FB7336F0 (queue_name), INDEX IDX_75EA56E0E3BD61CE (available_at), INDEX IDX_75EA56E016BA31DB (delivered_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE unite ADD CONSTRAINT FK_1D64C1184DE7DC5C FOREIGN KEY (adresse_id) REFERENCES adresse (id)');
        $this->addSql('ALTER TABLE `user` ADD CONSTRAINT FK_8D93D649EC4A74AB FOREIGN KEY (unite_id) REFERENCES unite (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE unite DROP FOREIGN KEY FK_1D64C1184DE7DC5C');
        $this->addSql('ALTER TABLE `user` DROP FOREIGN KEY FK_8D93D649EC4A74AB');
        $this->addSql('DROP TABLE adresse');
        $this->addSql('DROP TABLE unite');
        $this->addSql('DROP TABLE `user`');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
