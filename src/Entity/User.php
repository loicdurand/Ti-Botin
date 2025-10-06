<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: '`user`')]
class User
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $fonction = null;

    #[ORM\Column(length: 8, nullable: true)]
    private ?string $grade = null;

    #[ORM\Column(length: 50)]
    private ?string $nom = null;

    #[ORM\Column(length: 50)]
    private ?string $prenom = null;

    #[ORM\Column(length: 50)]
    private ?string $specificite = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $tph = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $port = null;

    #[ORM\Column(length: 10, nullable: true)]
    private ?string $tph_interne = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $mail = null;

    #[ORM\ManyToOne(inversedBy: 'users')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Unite $unite = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $qualification = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getFonction(): ?string
    {
        return $this->fonction;
    }

    public function setFonction(?string $fonction): static
    {
        $this->fonction = $fonction;

        return $this;
    }

    public function getGrade(): ?string
    {
        return $this->grade;
    }

    public function setGrade(?string $grade): static
    {
        $this->grade = $grade;

        return $this;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): static
    {
        $this->prenom = $prenom;

        return $this;
    }

    public function getSpecificite(): ?string
    {
        return $this->specificite;
    }

    public function setSpecificite(string $specificite): static
    {
        $this->specificite = $specificite;

        return $this;
    }

    public function getTph(): ?string
    {
        return $this->tph;
    }

    public function setTph(?string $tph): static
    {
        $this->tph = $tph;

        return $this;
    }

    public function getPort(): ?string
    {
        return $this->port;
    }

    public function setPort(?string $port): static
    {
        $this->port = $port;

        return $this;
    }

    public function getTphInterne(): ?string
    {
        return $this->tph_interne;
    }

    public function setTphInterne(?string $tph_interne): static
    {
        $this->tph_interne = $tph_interne;

        return $this;
    }

    public function getMail(): ?string
    {
        return $this->mail;
    }

    public function setMail(?string $mail): static
    {
        $this->mail = $mail;

        return $this;
    }

    public function getUnite(): ?Unite
    {
        return $this->unite;
    }

    public function setUnite(?Unite $unite): static
    {
        $this->unite = $unite;

        return $this;
    }

    public function getQualification(): ?string
    {
        return $this->qualification;
    }

    public function setQualification(?string $qualification): static
    {
        $this->qualification = $qualification;

        return $this;
    }
}
