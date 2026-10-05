package com.hotel.reservationsystem.service;

import com.hotel.reservationsystem.dto.PackageRequest;
import com.hotel.reservationsystem.dto.PackageResponse;

import java.util.List;

public interface PackageService {


    PackageResponse createPackage(PackageRequest request);

    List<PackageResponse> getAllPackages();

    PackageResponse getPackageById(Long id);

    PackageResponse updatePackage(Long id, PackageRequest request);

    void deletePackage(Long id);
}