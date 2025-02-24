
--@block
-- Creare tabel Clienti
CREATE TABLE Clienti (
    id_client INT PRIMARY KEY AUTO_INCREMENT,
    nume VARCHAR(50) NOT NULL,
    prenume VARCHAR(50) NOT NULL,
    adresa VARCHAR(100),
    telefon VARCHAR(15),
    email VARCHAR(50),
    CNP VARCHAR(13) UNIQUE
);
--@block
Select * from clienti


--@block
-- Creare tabel Administratori
CREATE TABLE Administratori (
    id_administrator INT PRIMARY KEY AUTO_INCREMENT,
    nume_complet VARCHAR(100) NOT NULL,
    adresa VARCHAR(100),
    telefon VARCHAR(15),
    email VARCHAR(50),
    CNP VARCHAR(13) UNIQUE
);
--@block
Select * from administratori




--@block
-- Creare tabel Utilizatori
CREATE TABLE Utilizatori (
    id_utilizator INT PRIMARY KEY AUTO_INCREMENT,
    nume_utilizator VARCHAR(50) NOT NULL,
    parola VARCHAR(50) NOT NULL,
    rol ENUM('client', 'administrator') NOT NULL,
    id_client INT,
    id_administrator INT,
    FOREIGN KEY (id_client) REFERENCES Clienti(id_client),
    FOREIGN KEY (id_administrator) REFERENCES Administratori(id_administrator)
);
--@block
Select * from utilizatori


--@block
-- Creare tabel Dispozitive
CREATE TABLE Dispozitive (
    id_dispozitiv INT PRIMARY KEY AUTO_INCREMENT,
    tip VARCHAR(50),
    marca VARCHAR(50),
    model VARCHAR(50),
    id_client INT,
    FOREIGN KEY (id_client) REFERENCES Clienti(id_client)
);
--@block
select * from dispozitive


--@block
-- Creare tabel Servicii
CREATE TABLE Servicii (
    id_serviciu INT PRIMARY KEY AUTO_INCREMENT,
    denumire VARCHAR(50) NOT NULL,
    pret DECIMAL(10, 2) NOT NULL,
    durata INT COMMENT 'Durata in minute'
);
--@block
Select * from servicii


--@block
-- Creare tabel Reparatii
CREATE TABLE Reparatii (
    id_reparatie INT PRIMARY KEY AUTO_INCREMENT,
    data DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    id_dispozitiv INT,
    FOREIGN KEY (id_dispozitiv) REFERENCES Dispozitive(id_dispozitiv)
);
--@block
Select * from reparatii



--@block
-- Creare tabel Tehnicieni
CREATE TABLE Tehnicieni (
    id_tehnician INT PRIMARY KEY AUTO_INCREMENT,
    nume_tehnician VARCHAR(50) NOT NULL,
    prenume_tehnician VARCHAR(50) NOT NULL,
    specializare VARCHAR(50),
    numar_telefon VARCHAR(15)
);
--@block
Select * from tehnicieni

--@block
-- Creare tabel Facturi
CREATE TABLE Facturi (
    id_factura INT PRIMARY KEY AUTO_INCREMENT,
    data_facturare DATE NOT NULL,
    suma DECIMAL(10, 2) NOT NULL,
    id_client INT,
    FOREIGN KEY (id_client) REFERENCES Clienti(id_client)
);
--@block
Select * from facturi


--@block
-- Creare tabel intermediar Reparatii_Servicii pentru relatia N-N intre Reparatie si Servicii
CREATE TABLE Reparatii_Servicii (
    id_reparatie INT,
    id_serviciu INT,
    PRIMARY KEY (id_reparatie, id_serviciu),
    FOREIGN KEY (id_reparatie) REFERENCES reparatii(id_reparatie),
    FOREIGN KEY (id_serviciu) REFERENCES Servicii(id_serviciu)
);
--@block
Select * from reparatii_servicii


--@block
-- Creare tabel intermediar Reparatii_Tehnicieni pentru relatia N-N intre Reparatie si Tehnicieni
CREATE TABLE Reparatii_Tehnicieni (
    id_reparatie INT,
    id_tehnician INT,
    PRIMARY KEY (id_reparatie, id_tehnician),
    FOREIGN KEY (id_reparatie) REFERENCES Reparatii(id_reparatie),
    FOREIGN KEY (id_tehnician) REFERENCES Tehnicieni(id_tehnician)
);
--@block
Select * from reparatii_tehnicieni

--@block
show tables

--@block
INSERT INTO Clienti (nume, prenume, adresa, telefon, email, CNP) VALUES
('Popescu', 'Ion', 'Strada Florilor 10', '0712345678', 'ion.popescu@email.com', '1234567890123'),
('Ionescu', 'Maria', 'Strada Libertatii 5', '0723456789', 'maria.ionescu@email.com', '2234567890123'),
('Georgescu', 'Andrei', 'Strada Primaverii 7', '0734567890', 'andrei.georgescu@email.com', '3234567890123'),
('Dumitrescu', 'Elena', 'Strada Victoriei 3', '0745678901', 'elena.dumitrescu@email.com', '4234567890123'),
('Radulescu', 'Cristian', 'Strada Pacii 15', '0756789012', 'cristian.radulescu@email.com', '5234567890123');
--@block
select * from clienti



--@block
INSERT INTO Administratori (nume_complet, email, CNP, telefon, adresa) VALUES
('Popa Mihai', 'mihai.popa@email.com', '6234567890123', '0721234567', 'Str. Libertății 10, București'),
('Morar Laura', 'laura.morar@email.com', '7234567890123', '0732234567', 'Bd. Unirii 5, Cluj-Napoca'),
('Radu Mircea', 'mircea.radu@email.com', '8234567890123', '0743234567', 'Str. Victoriei 22, Timișoara'),
('Iacob Ana', 'ana.iacob@email.com', '9234567890123', '0754234567', 'Str. Independenței 12, Iași'),
('Marin Oana', 'oana.marin@email.com', '0234567890123', '0765234567', 'Str. Eminescu 8, Constanța');
--@block
select * from administratori


--@block
INSERT INTO Utilizatori (nume_utilizator, parola, rol, id_client) VALUES
('Popescu Ion', 'parola1', 'client', 1),
('Ionescu Maria', 'parola2', 'client', 2),
('Georgescu Andrei', 'parola3', 'client', 3),
('Dumitrescu Elena', 'parola4', 'client', 4),
('Radulescu Cristian', 'parola5', 'client', 5);
--@block
select * from  utilizatori


--@block
INSERT INTO Utilizatori (nume_utilizator, parola, rol, id_administrator) VALUES
('Popa Mihai', 'admin1', 'administrator', 1),
('Morar Laura', 'admin2', 'administrator', 2),
('Radu Mircea', 'admin3', 'administrator', 3),
('Iacob Ana', 'admin4', 'administrator', 4),
('Marin Oana', 'admin5', 'administrator', 5);
--@block
select * from  utilizatori


--@block
INSERT INTO Dispozitive (tip, marca, model, id_client) VALUES
('Laptop', 'Dell', 'Inspiron 15', 1),
('Telefon', 'Samsung', 'Galaxy S21', 2),
('Tableta', 'Apple', 'iPad Air', 1),
('Laptop', 'HP', 'Pavilion', 4),
('Telefon', 'Huawei', 'P30', 5);
--@block
select* from dispozitive

--@block
INSERT INTO Servicii (denumire, pret, durata) VALUES
('Inlocuire ecran', 200.00, 60),
('Reparatie baterie', 100.00, 30),
('Diagnosticare', 50.00, 15),
('Upgrade SSD', 150.00, 45),
('Reparatie placa de baza', 300.00, 90);
--@block
select* from servicii



--@block
INSERT INTO reparatii (data, status, id_dispozitiv) VALUES
('2024-01-10', 'Finalizata', 1),
('2024-02-15', 'In asteptare', 2),
('2024-03-20', 'In asteptare', 3),
('2024-04-25', 'Finalizata', 4),
('2024-05-30', 'In asteptare', 5);
--@block
select* from reparatii


--@block
INSERT INTO Tehnicieni (nume_tehnician, prenume_tehnician, specializare, numar_telefon) VALUES
('Vasilescu', 'George', 'Electronica', '0767890123'),
('Pop', 'Ioana', 'Software', '0778901234'),
('Iliescu', 'Dan', 'Hardware', '0789012345'),
('Marin', 'Ana', 'Electromecanica', '0790123456'),
('Badea', 'Sorin', 'Reparatii placi de baza', '0701234567');
--@block
select* from tehnicieni


--@block
INSERT INTO Facturi (data_facturare, suma, id_client) VALUES
('2024-01-11', 250.00, 1),
('2024-02-16', 120.00, 2),
('2024-03-21', 80.00, 1),
('2024-04-26', 320.00, 4),
('2024-05-31', 150.00, 5);
--@block
select* from facturi

--@block
INSERT INTO Reparatii_Servicii (id_reparatie, id_serviciu) VALUES
(1, 1),
(1, 3),
(2, 2),
(3, 4),
(4, 5),
(5, 1);
--@block
select* from reparatii_servicii


--@block
INSERT INTO Reparatii_Tehnicieni (id_reparatie, id_tehnician) VALUES
(1, 1),
(4, 5);
--@block
select* from reparatii_tehnicieni


--istoric reparatii client
--@block
SELECT r.id_reparatie, r.data, r.status, d.tip AS tip_dispozitiv, d.marca, d.model FROM reparatii r JOIN dispozitive d ON r.id_dispozitiv = d.id_dispozitiv WHERE d.id_client = 1 ORDER BY r.data DESC;

-- toti utilizatorii
--@block
SELECT u.id_utilizator, u.nume_utilizator, u.rol, c.nume AS nume_client, c.prenume AS prenume_client, a.nume_complet AS nume_administrator FROM utilizatori u LEFT JOIN clienti c ON u.id_client = c.id_client LEFT JOIN administratori a ON u.id_administrator = a.id_administrator;


--reparatii si servicii asociate pentru tabel asignare tehbicieni

--@block
SELECT 
      r.id_reparatie,
      d.tip AS tip_dispozitiv,
      d.marca AS marca_dispozitiv,
      d.model AS model_dispozitiv,
      r.status,
      GROUP_CONCAT(s.denumire SEPARATOR ', ') AS servicii_necesare
    FROM reparatii r
    JOIN dispozitive d ON r.id_dispozitiv = d.id_dispozitiv
    LEFT JOIN reparatii_servicii rs ON r.id_reparatie = rs.id_reparatie
    LEFT JOIN servicii s ON rs.id_serviciu = s.id_serviciu
    WHERE r.status = 'In asteptare'
    GROUP BY r.id_reparatie, d.tip, d.marca, d.model, r.status;

-- reparatii cu servicii distincte si total
--@block

SELECT r.id_reparatie, GROUP_CONCAT(DISTINCT s.denumire SEPARATOR ', ') AS servicii_distincte, SUM(s.pret) AS total_cost FROM reparatii r JOIN reparatii_servicii rs ON r.id_reparatie = rs.id_reparatie JOIN servicii s ON rs.id_serviciu = s.id_serviciu GROUP BY r.id_reparatie HAVING SUM(s.pret) > 200 ORDER BY total_cost DESC;

--reparatii cu mai mult de un serviciu
--@block
SELECT r.id_reparatie, r.data, r.status, COUNT(rs.id_serviciu) AS NrServicii FROM reparatii r JOIN reparatii_servicii rs ON r.id_reparatie = rs.id_reparatie GROUP BY r.id_reparatie, r.data, r.status HAVING COUNT(rs.id_serviciu) > 1 ORDER BY NrServicii DESC;

--servicii si numarul tottalm de clienti care le-au ales
--@block
SELECT s.denumire AS Serviciu, COUNT(DISTINCT c.id_client) AS NrClienti FROM servicii s JOIN reparatii_servicii rs ON s.id_serviciu = rs.id_serviciu JOIN reparatii r ON rs.id_reparatie = r.id_reparatie JOIN dispozitive d ON r.id_dispozitiv = d.id_dispozitiv JOIN clienti c ON d.id_client = c.id_client GROUP BY s.id_serviciu, s.denumire ORDER BY NrClienti DESC;

--subcereri complexe


--reparatii finalizate
--@block
SELECT 
        r.id_reparatie,
        d.tip AS tip_dispozitiv,
        d.marca AS marca_dispozitiv,
        d.model AS model_dispozitiv,
        r.data,
        r.status,
        (
            SELECT SUM(s.pret)
            FROM reparatii_servicii rs
            JOIN servicii s ON rs.id_serviciu = s.id_serviciu
            WHERE rs.id_reparatie = r.id_reparatie
        ) AS cost_total
    FROM reparatii r
    JOIN dispozitive d ON r.id_dispozitiv = d.id_dispozitiv
    WHERE r.status = 'Finalizata';
  

-- Vizualizarea clienților ordonați după numărul de dispozitive aduse la reparat 
--@block
SELECT 
        c.nume AS Nume, 
        c.prenume AS Prenume 
    FROM clienti c 
    ORDER BY (
        SELECT COUNT(d.id_dispozitiv) 
FROM dispozitive d 
        WHERE d.id_client = c.id_client 
    ) DESC;

--	Obținerea listei de clienți care nu au adus dispozitive pentru reparații - Interogare complexă cu subinterogare în clauza WHERE 
--@block
SELECT c.nume, c.prenume
    FROM clienti c
    WHERE c.id_client NOT IN (
        SELECT d.id_client
        FROM dispozitive d
    );
 
 --	Clienții cu suma totală facturată mai mare decât media facturilor - Interogare complexă cu subinterogare în clauza HAVING 
 --@block
 SELECT c.nume, c.prenume, SUM(f.suma) AS suma_totala FROM clienti c JOIN facturi f ON c.id_client = f.id_client GROUP BY c.id_client, c.nume, c.prenume HAVING SUM(f.suma) > (SELECT AVG(suma) FROM facturi);

--@block
select * from clienti

--@block
select * administratori

--@block
select * utilizatori

--@block
select * dispozitive

--@block
select * tehnicieni

--@block
select * reparatii

--@block
select * reparatii_servicii

--@block
select * reparatii_tehnicieni
