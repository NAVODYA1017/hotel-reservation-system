// ═══════════════════════════════════════════════════════════════════════
// FILE : HotelReservationSystemApplication.java
// ROLE : Main entry point of the Spring Boot application
// ═══════════════════════════════════════════════════════════════════════
package com.hotel.reservationsystem;

// ── IMPORT EXPLANATIONS ─────────────────────────────────────────────────
// User                 – JPA entity representing a row in the "users" table.
// Role                 – Enum of possible user roles in the system.
// UserRepository       – Spring Data JPA repository for CRUD operations on users.
// CommandLineRunner    – A Spring Boot interface. If you return a CommandLineRunner
//                        bean, Spring calls its run() method AFTER the application
//                        starts. Used here to seed the database with a default admin.
// SpringApplication    – The class that bootstraps (starts) the Spring Boot app.
//                        It creates the ApplicationContext, scans for @Component,
//                        @Service, @Controller, @Repository beans, and starts
//                        the embedded Tomcat web server.
// @SpringBootApplication – A convenience annotation that combines:
//                          @Configuration   – this class can define @Bean methods.
//                          @EnableAutoConfiguration – Spring auto-configures beans
//                              based on the dependencies in pom.xml (e.g., it sees
//                              spring-boot-starter-data-jpa and auto-configures
//                              DataSource, EntityManagerFactory, etc.).
//                          @ComponentScan   – scans this package and all sub-packages
//                              for @Component, @Service, @Controller, @Repository.
// @Bean                – Tells Spring that this method returns an object that should
//                        be managed as a Spring bean (singleton by default).
// BCryptPasswordEncoder – Hashes passwords using the BCrypt algorithm so they
//                         are never stored as plain text in the database.
// ─────────────────────────────────────────────────────────────────────────
import com.hotel.reservationsystem.entity.User;
import com.hotel.reservationsystem.entity.enums.Role;
import com.hotel.reservationsystem.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

// @SpringBootApplication – marks this as the main configuration class AND
//   triggers auto-configuration and component scanning.
//   Spring will automatically discover all @Controller, @Service, @Repository,
//   and @Component classes in this package and its sub-packages.
@SpringBootApplication
public class HotelReservationSystemApplication {

	// main() – the standard Java entry point. SpringApplication.run() does:
	//   1. Creates the Spring ApplicationContext (IoC container).
	//   2. Scans for all Spring-managed beans (@Controller, @Service, etc.).
	//   3. Auto-configures DataSource, JPA, Security, etc. based on pom.xml.
	//   4. Starts the embedded Tomcat server on port 8080.
	//   5. Runs any CommandLineRunner beans.
	public static void main(String[] args) {
		SpringApplication.run(HotelReservationSystemApplication.class, args);
	}

	// @Bean – this method returns a CommandLineRunner that Spring will execute
	//   once the application context is fully loaded.
	// CommandLineRunner – a functional interface with a single run() method.
	//   Used here to seed the database with a default admin account on startup.
	@Bean
	CommandLineRunner initDatabase(UserRepository userRepository) {
		// Lambda expression (args -> { ... }) – implements the run() method
		//   of the CommandLineRunner interface.
		return args -> {
			// Print all existing users for debugging (visible in the console log).
			System.out.println("--- USERS IN DATABASE ---");
			// userRepository.findAll() – fetches every row from the users table.
			// .forEach() – iterates over each user and prints their details.
			userRepository.findAll().forEach(u -> {
				System.out.println(u.getEmail() + " | role: " + u.getRole() + " | passHash: " + u.getPasswordHash());
			});
			System.out.println("-------------------------");

			// userRepository.count() – returns the total number of rows in users table.
			//   Equivalent to: SELECT COUNT(*) FROM users;
			if (userRepository.count() == 0) {
				// No users exist → create the default System Admin account.
				User admin = new User();
				admin.setName("System Admin");
				admin.setEmail("admin@hotel.com");
				// BCryptPasswordEncoder.encode() – hashes "admin123" into a BCrypt hash.
				//   The hash looks like "$2a$10$..." and is irreversible.
				admin.setPasswordHash(new BCryptPasswordEncoder().encode("admin123"));
				admin.setRole(Role.SYSTEM_ADMIN);
				admin.setActive(true);
				// userRepository.save(admin) – persists the admin user (INSERT).
				userRepository.save(admin);
				System.out.println("Created default admin user: admin@hotel.com / admin123");
			} else {
				// Users exist → ensure the admin account exists with the right password.
				// stream() – converts the List to a Stream for functional-style processing.
				// filter() – keeps only users with email "admin@hotel.com".
				// findFirst() – returns the first match as Optional<User>.
				// orElse(new User()) – if no admin found, create a new User object.
				User admin = userRepository.findAll().stream().filter(u -> u.getEmail().equals("admin@hotel.com")).findFirst().orElse(new User());
				admin.setName("System Admin");
				admin.setEmail("admin@hotel.com");
				admin.setPasswordHash(new BCryptPasswordEncoder().encode("admin123"));
				admin.setRole(Role.SYSTEM_ADMIN);
				admin.setActive(true);
				userRepository.save(admin);
				System.out.println("Updated/Created default admin user: admin@hotel.com / admin123");
			}
		};
	}
}
