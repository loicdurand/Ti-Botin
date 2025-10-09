<?php

namespace App\Entity;

use App\Repository\AdresseRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AdresseRepository::class)]
class Adresse
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $ligne1 = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $ligne2 = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $ligne3 = null;

    #[ORM\Column]
    private ?int $code_postal = null;

    #[ORM\Column(length: 255)]
    private ?string $commune = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $lng = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $lat = null;

    /**
     * @var Collection<int, Unite>
     */
    #[ORM\OneToMany(targetEntity: Unite::class, mappedBy: 'adresse')]
    private Collection $unites;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $geoAddress = null;

    #[ORM\Column(type: Types::SIMPLE_ARRAY, nullable: true)]
    private ?array $aliasses = null;

    public function __construct()
    {
        $this->unites = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLigne1(): ?string
    {
        return $this->ligne1;
    }

    public function setLigne1(?string $ligne1): static
    {
        $this->ligne1 = $ligne1;

        return $this;
    }

    public function getLigne2(): ?string
    {
        return $this->ligne2;
    }

    public function setLigne2(?string $ligne2): static
    {
        $this->ligne2 = $ligne2;

        return $this;
    }

    public function getLigne3(): ?string
    {
        return $this->ligne3;
    }

    public function setLigne3(?string $ligne3): static
    {
        $this->ligne3 = $ligne3;

        return $this;
    }

    public function getCodePostal(): ?int
    {
        return $this->code_postal;
    }

    public function setCodePostal(int $code_postal): static
    {
        $this->code_postal = $code_postal;

        return $this;
    }

    public function getCommune(): ?string
    {
        return $this->commune;
    }

    public function setCommune(string $commune): static
    {
        $this->commune = $commune;

        return $this;
    }

    public function getLng(): ?string
    {
        return $this->lng;
    }

    public function setLng(?string $lng): static
    {
        $this->lng = $lng;

        return $this;
    }

    public function getLat(): ?string
    {
        return $this->lat;
    }

    public function setLat(?string $lat): static
    {
        $this->lat = $lat;

        return $this;
    }

    /**
     * @return Collection<int, Unite>
     */
    public function getUnites(): Collection
    {
        return $this->unites;
    }

    public function addUnite(Unite $unite): static
    {
        if (!$this->unites->contains($unite)) {
            $this->unites->add($unite);
            $unite->setAdresse($this);
        }

        return $this;
    }

    public function removeUnite(Unite $unite): static
    {
        if ($this->unites->removeElement($unite)) {
            // set the owning side to null (unless already changed)
            if ($unite->getAdresse() === $this) {
                $unite->setAdresse(null);
            }
        }

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

    public function getAliasses(): ?array
    {
        return $this->aliasses;
    }

    public function setAliasses(?array $aliasses): static
    {
        $this->aliasses = $aliasses;

        return $this;
    }
}
