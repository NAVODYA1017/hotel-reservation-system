package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.PackageRequest;
import com.hotel.reservationsystem.dto.PackageResponse;
import com.hotel.reservationsystem.entity.Package;
import com.hotel.reservationsystem.exception.ResourceNotFoundException;
import com.hotel.reservationsystem.repository.PackageRepository;
import com.hotel.reservationsystem.repository.ReservationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PackageServiceImpl implements PackageService {

    private final PackageRepository packageRepository;
    private final ReservationRepository reservationRepository;

    public PackageServiceImpl(
            PackageRepository packageRepository,
            ReservationRepository reservationRepository) {

        this.packageRepository = packageRepository;
        this.reservationRepository = reservationRepository;
    }


    // =========================================================
    // 1. CREATE EVENT PACKAGE
    // =========================================================

    @Override
    @Transactional
    public PackageResponse createPackage(
            PackageRequest request) {

        // Validate package information
        validatePackageRequest(request);

        String packageName =
                request.getName().trim();

        // Prevent duplicate package names
        if (packageRepository
                .existsByNameIgnoreCase(packageName)) {

            throw new IllegalArgumentException(
                    "An event package with the name '"
                            + packageName
                            + "' already exists."
            );
        }


        // Create Package entity
        Package pkg = new Package();

        pkg.setName(packageName);

        pkg.setDescription(
                request.getDescription()
        );

        pkg.setPrice(
                request.getPrice()
        );

        pkg.setServicesIncluded(
                request.getServicesIncluded() != null
                        ? request.getServicesIncluded().trim()
                        : ""
        );


        // Save package
        Package saved =
                packageRepository.save(pkg);

        // Entity → Response DTO
        return PackageResponse.fromEntity(saved);
    }


    // =========================================================
    // 2. GET ALL EVENT PACKAGES
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<PackageResponse> getAllPackages() {

        return packageRepository.findAll()
                .stream()
                .map(PackageResponse::fromEntity)
                .collect(Collectors.toList());
    }


    // =========================================================
    // 3. GET PACKAGE BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public PackageResponse getPackageById(Long id) {

        Package pkg =
                packageRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Event package not found with ID: "
                                                + id
                                )
                        );

        return PackageResponse.fromEntity(pkg);
    }


    // =========================================================
    // 4. UPDATE EVENT PACKAGE
    // =========================================================

    @Override
    @Transactional
    public PackageResponse updatePackage(
            Long id,
            PackageRequest request) {

        // Validate incoming package data
        validatePackageRequest(request);

        // Find existing package
        Package existingPackage =
                packageRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Event package not found with ID: "
                                                + id
                                )
                        );


        String newName =
                request.getName().trim();


        // Prevent duplicate package names
        // when changing the package name.
        if (!newName.equalsIgnoreCase(
                existingPackage.getName())
                && packageRepository
                .existsByNameIgnoreCase(newName)) {

            throw new IllegalArgumentException(
                    "An event package with the name '"
                            + newName
                            + "' already exists."
            );
        }


        // Update entity
        existingPackage.setName(newName);

        existingPackage.setDescription(
                request.getDescription()
        );

        existingPackage.setPrice(
                request.getPrice()
        );

        existingPackage.setServicesIncluded(
                request.getServicesIncluded() != null
                        ? request.getServicesIncluded().trim()
                        : ""
        );


        // Save updated package
        Package updated =
                packageRepository.save(existingPackage);

        return PackageResponse.fromEntity(updated);
    }


    // =========================================================
    // 5. DELETE EVENT PACKAGE
    // =========================================================

    @Override
    @Transactional
    public void deletePackage(Long id) {

        // Find package
        Package pkg =
                packageRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Event package not found with ID: "
                                                + id
                                )
                        );


        // Check whether the package is linked
        // to existing reservation records.
        boolean isLinkedToReservations =
                reservationRepository
                        .existsByEventPackage_Id(id);


        if (isLinkedToReservations) {

            throw new IllegalStateException(
                    "Cannot delete Package '"
                            + pkg.getName()
                            + "' because it is linked to "
                            + "existing reservation records."
            );
        }


        // Delete package
        packageRepository.delete(pkg);
    }


    // =========================================================
    // 6. VALIDATE PACKAGE REQUEST
    // =========================================================

    private void validatePackageRequest(
            PackageRequest request) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Package request cannot be null."
            );
        }


        if (request.getName() == null
                || request.getName()
                .trim()
                .isEmpty()) {

            throw new IllegalArgumentException(
                    "Package name is required."
            );
        }


        if (request.getPrice() == null
                || request.getPrice()
                .compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Invalid package price. "
                            + "Price must be greater than zero."
            );
        }


        if (request.getServicesIncluded() == null
                || request.getServicesIncluded()
                .trim()
                .isEmpty()) {

            throw new IllegalArgumentException(
                    "Incomplete package information: "
                            + "services included must be specified."
            );
        }
    }
}