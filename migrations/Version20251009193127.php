<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251009193127 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE unite ADD cn VARCHAR(255) DEFAULT NULL, ADD subdivision VARCHAR(255) DEFAULT NULL, ADD telephone_number VARCHAR(20) DEFAULT NULL, ADD mail VARCHAR(255) DEFAULT NULL, ADD l VARCHAR(255) DEFAULT NULL, ADD postal_address VARCHAR(255) DEFAULT NULL, ADD capacite_judiciaire TINYINT(1) DEFAULT NULL, ADD department_uid VARCHAR(255) DEFAULT NULL, ADD parent_department_uid VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE user ADD position_administrative VARCHAR(8) DEFAULT NULL, ADD account_status VARCHAR(20) DEFAULT NULL, ADD civilite VARCHAR(8) DEFAULT NULL, ADD employee_type VARCHAR(20) DEFAULT NULL, ADD grade_long VARCHAR(50) DEFAULT NULL, ADD statut_corps VARCHAR(20) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE `user` DROP position_administrative, DROP account_status, DROP civilite, DROP employee_type, DROP grade_long, DROP statut_corps');
        $this->addSql('ALTER TABLE unite DROP cn, DROP subdivision, DROP telephone_number, DROP mail, DROP l, DROP postal_address, DROP capacite_judiciaire, DROP department_uid, DROP parent_department_uid');
    }
}
