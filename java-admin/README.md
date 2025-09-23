# PIM Java Admin Desktop Application

JavaFX-based desktop admin interface for the PIM (Product Information Management) system.

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- Backend running on http://localhost:3010

## Setup

1. Install dependencies:
```bash
mvn clean install
```

2. Run the application:
```bash
mvn javafx:run
```

## Default Login

- Email: admin@test.com
- Password: Admin123!

## Project Structure

```
java-admin/
├── src/main/java/com/pim/admin/
│   ├── api/          # REST service interfaces
│   ├── models/       # Data models
│   ├── controllers/  # UI controllers
│   ├── services/     # Business logic
│   ├── config/       # Configuration
│   └── MainApp.java  # Application entry point
└── src/main/resources/
    ├── fxml/         # UI layouts
    ├── css/          # Stylesheets
    └── images/       # Icons and images
```

## Features

- [x] Authentication
- [x] Product listing
- [x] REST API integration
- [ ] Product CRUD operations
- [ ] Variant management
- [ ] Status management
- [ ] Search and filtering
- [ ] Pagination

## Building for Distribution

```bash
mvn clean package
```

This creates an executable JAR in `target/` directory.
