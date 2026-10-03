package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.PackageRequest;
import com.hotel.reservationsystem.dto.PackageResponse;

import java.util.List;

public interface PackageService {

    // Create a new event package
    PackageResponse createPackage(PackageRequest request);

    // Get all event packages
    List<PackageResponse> getAllPackages();

    // Get an event package by ID
    PackageResponse getPackageById(Long id);

    // Update an existing event package
    PackageResponse updatePackage(
            Long id,
            PackageRequest request);

    // Delete an event package
    void deletePackage(Long id);
}