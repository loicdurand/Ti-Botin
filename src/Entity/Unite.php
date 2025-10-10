<?php

namespace App\Entity;

use App\Repository\UniteRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UniteRepository::class)]
class Unite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $code = null;

    #[ORM\Column(length: 50)]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $geoAddress = null;

    #[ORM\Column(nullable: true)]
    private ?int $postalCode = null;

    #[ORM\ManyToOne(inversedBy: 'unites', cascade: ['persist'])]
    private ?Adresse $adresse = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $cn = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $subdivision = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $telephoneNumber = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $mail = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $l = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $postalAddress = null;

    #[ORM\Column(nullable: true)]
    private ?bool $capaciteJudiciaire = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $departmentUID = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $parentDepartmentUID = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCode(): ?int
    {
        return $this->code;
    }

    public function setCode(int $code): static
    {
        $this->code = $code;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getGeoAddress(): ?string
    {
        return $this->geoAddress;
    }

    public function setGeoAddress(?string $geoAddress): static
    {
        $this->geoAddress = $geoAddress;

        return $this;
    }

    public function getPostalCode(): ?int
    {
        return $this->postalCode;
    }

    public function setPostalCode(?int $postalCode): static
    {
        $this->postalCode = $postalCode;

        return $this;
    }

    public function getAdresse(): ?Adresse
    {
        return $this->adresse;
    }

    public function setAdresse(?Adresse $adresse): static
    {
        $this->adresse = $adresse;

        return $this;
    }

    public function getCn(): ?string
    {
        return $this->cn;
    }

    public function setCn(?string $cn): static
    {
        $this->cn = $cn;

        return $this;
    }

    public function getSubdivision(): ?string
    {
        return $this->subdivision;
    }

    public function setSubdivision(?string $subdivision): static
    {
        $this->subdivision = $subdivision;

        return $this;
    }

    public function getTelephoneNumber(): ?string
    {
        return $this->telephoneNumber;
    }

    public function setTelephoneNumber(?string $telephoneNumber): static
    {
        $this->telephoneNumber = $telephoneNumber;

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

    public function getL(): ?string
    {
        return $this->l;
    }

    public function setL(?string $l): static
    {
        $this->l = $l;

        return $this;
    }

    public function getPostalAddress(): ?string
    {
        return $this->postalAddress;
    }

    public function setPostalAddress(?string $postalAddress): static
    {
        $this->postalAddress = $postalAddress;

        return $this;
    }

    public function isCapaciteJudiciaire(): ?bool
    {
        return $this->capaciteJudiciaire;
    }

    public function setCapaciteJudiciaire(?bool $capaciteJudiciaire): static
    {
        $this->capaciteJudiciaire = $capaciteJudiciaire;

        return $this;
    }

    public function getDepartmentUID(): ?string
    {
        return $this->departmentUID;
    }

    public function setDepartmentUID(?string $departmentUID): static
    {
        $this->departmentUID = $departmentUID;

        return $this;
    }

    public function getParentDepartmentUID(): ?string
    {
        return $this->parentDepartmentUID;
    }

    public function setParentDepartmentUID(?string $parentDepartmentUID): static
    {
        $this->parentDepartmentUID = $parentDepartmentUID;

        return $this;
    }
}
