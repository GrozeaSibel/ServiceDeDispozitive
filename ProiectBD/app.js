// Importăm modulele necesare
const express = require("express"); // Framework web pentru Node.js
const bodyParser = require("body-parser"); // Middleware pentru parsarea datelor din corpul cererilor HTTP
const mysql = require("mysql2"); // Modul pentru conexiunea la baza de date MySQL

// Creăm o instanță de aplicație Express
const app = express();

// Configurăm middleware pentru parsarea JSON-ului din cererile HTTP
app.use(bodyParser.json()); // Transformă corpul cererii în JSON pentru acces ușor

// Servim fișierele statice din directorul "public"
app.use(express.static("public"));

// Configurarea conexiunii la baza de date
const db = mysql.createConnection({
  host: "localhost", // Adresa serverului MySQL
  user: "sibel", // Numele de utilizator pentru conexiune
  password: "sibi", // Parola utilizatorului
  database: "servicedispozitive", // Numele bazei de date
  port: 3306, // Portul pe care rulează serverul MySQL (implicit 3306)
});

// Realizăm conexiunea la baza de date
// Dacă apare o eroare, aceasta este logată în consolă
// Dacă conexiunea este reușită, apare un mesaj de confirmare
db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Endpoint pentru autentificare (login)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body; // Extragem numele de utilizator și parola din cerere

  // Interogare simplă pentru verificarea utilizatorului
  const query = "SELECT * FROM utilizatori WHERE nume_utilizator = ?";

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // Dacă utilizatorul nu este găsit, returnăm un mesaj corespunzător
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0]; // Preluăm datele utilizatorului din rezultate

    // Comparăm parola introdusă cu cea stocată în baza de date
    if (password === user.parola) {
      if (user.rol === "client") {
        // Răspuns pentru utilizator cu rol de client
        res.json({
          message: "Login successful",
          user: {
            id: user.id_utilizator,
            nume_utilizator: user.nume_utilizator,
            rol: user.rol,
            id_client: user.id_client,
          },
        });
      } else if (user.rol === "administrator") {
        // Răspuns pentru utilizator cu rol de administrator
        res.json({
          message: "Login successful",
          user: {
            id: user.id_utilizator,
            nume_utilizator: user.nume_utilizator,
            rol: user.rol,
            id_administrator: user.id_administrator,
          },
        });
      }
    } else {
      // Dacă parola este incorectă, returnăm un mesaj de eroare
      res.status(401).json({ message: "Invalid password" });
    }
  });
});

// Pornim serverul pe portul specificat
const PORT = 3000; // Portul pe care rulează serverul
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Endpoint pentru preluarea datelor personale ale unui client
app.get("/api/client/date-personale/:id_client", (req, res) => {
  const idClient = req.params.id_client; // Preluăm ID-ul clientului din parametrii URL

  // Interogare simplă pentru extragerea datelor personale
  const query = `
    SELECT nume, prenume, adresa, telefon, email, CNP
    FROM clienti
    WHERE id_client = ?
  `;

  db.query(query, [idClient], (err, results) => {
    if (err) {
      console.error("Eroare query baza de date:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // Dacă nu există client cu ID-ul specificat, returnăm eroare
    if (results.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Returnăm datele personale ale clientului
    res.json(results[0]);
  });
});

// Endpoint pentru actualizarea datelor personale ale unui client
app.put("/api/client/date-personale/:id_client", (req, res) => {
  const idClient = req.params.id_client; // Preluăm ID-ul clientului din URL
  const { nume, prenume, adresa, telefon, email } = req.body; // Extragem datele din cerere

  console.log("Cerere PUT pentru clientul:", idClient); // Log pentru debug
  console.log("Date primite pentru actualizare:", req.body); // Log date primite

  // Interogare pentru actualizarea datelor clientului
  const query = `
    UPDATE clienti
    SET nume = ?, prenume = ?, adresa = ?, telefon = ?, email = ?
    WHERE id_client = ?
  `;

  db.query(
    query,
    [nume, prenume, adresa, telefon, email, idClient],
    (err, results) => {
      if (err) {
        console.error("Eroare query baza de date:", err);
        return res.status(500).json({ message: "Database error" });
      }

      // Verificăm dacă clientul a fost găsit și actualizat
      if (results.affectedRows === 0) {
        console.log("Clientul nu a fost găsit.");
        return res.status(404).json({ message: "Client not found" });
      }

      console.log("Date actualizate cu succes!");
      res.json({ message: "Date actualizate cu succes!" });
    }
  );
});

// Endpoint pentru adăugarea unui dispozitiv, reparațiilor aferente și crearea facturii
app.post("/api/dispozitive-reparatii", (req, res) => {
  const { id_client, tip, marca, model, reparatii } = req.body;

  if (!id_client || !tip || !marca || !model || !reparatii) {
    return res
      .status(400)
      .json({ message: "Toate câmpurile sunt obligatorii!" });
  }

  const queryDispozitiv = `
    INSERT INTO dispozitive (tip, marca, model, id_client)
    VALUES (?, ?, ?, ?);
  `;

  db.query(queryDispozitiv, [tip, marca, model, id_client], (err, result) => {
    if (err) {
      console.error("Eroare la adăugarea dispozitivului:", err);
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }

    const idDispozitiv = result.insertId;

    let sumaTotala = 0;

    const reparatiePromises = reparatii.map((reparatie) => {
      return new Promise((resolve, reject) => {
        db.query(
          `SELECT id_serviciu, pret FROM servicii WHERE denumire = ?`,
          [reparatie],
          (err, results) => {
            if (err) {
              return reject(err);
            }

            if (results.length > 0) {
              const { id_serviciu, pret } = results[0];
              sumaTotala += pret;

              const queryReparatie = `
                INSERT INTO reparatii (data, status, id_dispozitiv)
                VALUES (NOW(), 'In asteptare', ?);
              `;

              db.query(
                queryReparatie,
                [idDispozitiv],
                (err, reparatieResult) => {
                  if (err) {
                    return reject(err);
                  }

                  const idReparatie = reparatieResult.insertId;

                  // Inserăm în tabela reparatii_servicii
                  const queryReparatiiServicii = `
                  INSERT INTO reparatii_servicii (id_reparatie, id_serviciu)
                  VALUES (?, ?);
                `;

                  db.query(
                    queryReparatiiServicii,
                    [idReparatie, id_serviciu],
                    (err) => {
                      if (err) {
                        return reject(err);
                      }
                      resolve();
                    }
                  );
                }
              );
            } else {
              resolve();
            }
          }
        );
      });
    });

    Promise.all(reparatiePromises)
      .then(() => {
        const queryFactura = `
          INSERT INTO facturi (data_facturare, suma, id_client)
          VALUES (NOW(), ?, ?);
        `;

        db.query(queryFactura, [sumaTotala, id_client], (err) => {
          if (err) {
            console.error("Eroare la generarea facturii:", err);
            return res
              .status(500)
              .json({ message: "Eroare la generarea facturii!" });
          }

          res.status(201).json({
            message: "Dispozitiv, reparații și factură adăugate cu succes!",
            sumaTotala,
          });
        });
      })
      .catch((error) => {
        console.error("Eroare la adăugarea reparațiilor:", error);
        res.status(500).json({ message: error });
      });
  });
});

// Endpoint pentru obținerea dispozitivelor proprii ale unui client
app.get("/api/dispozitive/:id_client", (req, res) => {
  const idClient = req.params.id_client; // Extrage ID-ul clientului din parametrii URL

  const query = `
    SELECT id_dispozitiv, tip, marca, model
    FROM dispozitive
    WHERE id_client = ?`; // Interogare simpla pentru a obține toate dispozitivele asociate clientului specificat

  db.query(query, [idClient], (err, results) => {
    if (err) {
      // Gestionarea erorilor SQL
      console.error("Eroare query baza de date:", err);
      return res
        .status(500)
        .json({ message: "Eroare la preluarea dispozitivelor!" });
    }

    if (results.length === 0) {
      // Dacă nu există dispozitive pentru clientul respectiv
      return res
        .status(404)
        .json({ message: "Nu există dispozitive asociate acestui client!" });
    }

    res.json(results); // Returnează lista dispozitivelor clientului
  });
});

// Endpoint pentru istoricul reparațiilor unui client
app.get("/api/reparatii/:id_client", (req, res) => {
  const idClient = req.params.id_client; // Extrage ID-ul clientului din parametrii URL

  console.log(
    `Cerere primită pentru istoricul reparațiilor - ID Client: ${idClient}`
  );

  const query = `
      SELECT r.id_reparatie, r.data, r.status, d.tip AS tip_dispozitiv, d.marca, d.model
      FROM reparatii r
      JOIN dispozitive d ON r.id_dispozitiv = d.id_dispozitiv
      WHERE d.id_client = ?
      ORDER BY r.data DESC`; // Interogare pentru a obține istoricul reparațiilor cu detalii despre dispozitiv

  db.query(query, [idClient], (err, results) => {
    if (err) {
      // Gestionarea erorilor SQL
      console.error("Eroare query baza de date:", err);
      return res
        .status(500)
        .json({ message: "Eroare la preluarea reparațiilor!" });
    }

    console.log("Rezultate interogare:", results);
    res.json(results); // Returnează istoricul reparațiilor
  });
});

// Endpoint pentru detaliile unei reparații specifice
app.get("/api/reparatii/:id_reparatie", (req, res) => {
  const idReparatie = req.params.id_reparatie; // Extrage ID-ul reparației din parametrii URL

  console.log("Cerere primită pentru ID Reparatie:", idReparatie);

  const query = `
    SELECT r.id_reparatie, r.data, r.status, d.tip AS tip_dispozitiv, d.marca, d.model
    FROM reparatii r
    JOIN dispozitive d ON r.id_dispozitiv = d.id_dispozitiv
    WHERE r.id_reparatie = ?;`; // Interogare simpla pentru detalii reparație și dispozitiv

  db.query(query, [idReparatie], (err, results) => {
    if (err) {
      // Gestionarea erorilor SQL
      console.error("Eroare la interogarea detaliilor reparației:", err);
      return res
        .status(500)
        .json({ message: "Eroare la preluarea detaliilor reparației!" });
    }

    if (results.length === 0) {
      // Dacă reparația nu există
      return res.status(404).json({ message: "Reparația nu a fost găsită!" });
    }

    res.json(results[0]); // Returnează detaliile reparației
  });
});

// Endpoint pentru serviciile asociate unei reparații
app.get("/api/reparatii/servicii/:id_reparatie", (req, res) => {
  const idReparatie = req.params.id_reparatie; // Extrage ID-ul reparației din parametrii URL

  const query = `
    SELECT s.denumire, s.pret, s.durata
    FROM reparatii_servicii rs
    JOIN servicii s ON rs.id_serviciu = s.id_serviciu
    WHERE rs.id_reparatie = ?;`; // Interogare simpla pentru a obține serviciile asociate unei reparații

  db.query(query, [idReparatie], (err, results) => {
    if (err) {
      // Gestionarea erorilor SQL
      console.error("Eroare la interogarea serviciilor reparației:", err);
      return res
        .status(500)
        .json({ message: "Eroare la preluarea serviciilor reparației!" });
    }

    res.json(results); // Returnează lista serviciilor asociate
  });
});

// Endpoint pentru tehnicienii implicați într-o reparație
app.get("/api/reparatii/tehnicieni/:id_reparatie", (req, res) => {
  const idReparatie = req.params.id_reparatie; // Extrage ID-ul reparației din parametrii URL

  const query = `
    SELECT t.nume_tehnician, t.prenume_tehnician, t.specializare
    FROM reparatii_tehnicieni rt
    JOIN tehnicieni t ON rt.id_tehnician = t.id_tehnician
    WHERE rt.id_reparatie = ?;`; // Interogare simpla pentru a obține tehnicienii implicați în reparație

  db.query(query, [idReparatie], (err, results) => {
    if (err) {
      // Gestionarea erorilor SQL
      console.error("Eroare la interogarea tehnicienilor reparației:", err);
      return res
        .status(500)
        .json({ message: "Eroare la preluarea tehnicienilor reparației!" });
    }

    res.json(results); // Returnează lista tehnicienilor
  });
});

// Endpoint pentru listarea facturilor unui client
app.get("/api/facturi/:id_client", (req, res) => {
  const idClient = req.params.id_client; // Extrage ID-ul clientului din parametrii URL

  const query = `
    SELECT id_factura, data_facturare, suma
    FROM Facturi
    WHERE id_client = ?
    ORDER BY data_facturare DESC`; // Interogare simpla pentru obținerea facturilor unui client

  db.query(query, [idClient], (err, results) => {
    if (err) {
      // Gestionarea erorilor SQL
      console.error("Eroare la preluarea facturilor:", err);
      return res
        .status(500)
        .json({ message: "Eroare la preluarea facturilor" });
    }

    res.json(results); // Returnează lista facturilor
  });
});

// Endpoint pentru preluarea serviciilor disponibile
app.get("/api/servicii", (req, res) => {
  // Interogare simpla pentru a obține lista tuturor serviciilor disponibile
  const query = "SELECT id_serviciu, denumire, pret, durata FROM servicii";

  db.query(query, (err, results) => {
    if (err) {
      // Gestionarea erorilor în cazul eșecului interogării
      console.error("Eroare la preluarea serviciilor:", err);
      return res
        .status(500)
        .json({ message: "Eroare la preluarea serviciilor!" });
    }
    // Returnează lista serviciilor disponibile în format JSON
    res.json(results);
  });
});
// SIGNUP - Endpoint pentru crearea unui nou cont de utilizator
app.post("/api/signup", (req, res) => {
  // Extrage datele utilizatorului din corpul cererii
  const { username, password, nume, prenume, cnp, adresa, telefon, email } =
    req.body;

  // Verifică dacă toate câmpurile obligatorii sunt furnizate
  if (!username || !password || !nume || !prenume || !cnp) {
    return res.status(400).json({ message: "Toate câmpurile obligatorii!" });
  }

  // Inserare în tabela 'clienti'
  const queryClienti = `
    INSERT INTO clienti (nume, prenume, adresa, telefon, email, CNP)
    VALUES (?, ?, ?, ?, ?, ?);
  `;

  db.query(
    queryClienti,
    [nume, prenume, adresa || null, telefon || null, email || null, cnp],
    (err, result) => {
      if (err) {
        // Gestionarea erorilor SQL
        console.error("Eroare la inserarea în tabela clienti:", err);
        return res.status(500).json({ message: "Eroare la baza de date!" });
      }

      const idClient = result.insertId; // Obține ID-ul clientului nou creat

      // Inserare în tabela 'utilizatori'
      const queryUtilizatori = `
        INSERT INTO utilizatori (nume_utilizator, parola, rol, id_client)
        VALUES (?, ?, 'client', ?);
      `;

      db.query(queryUtilizatori, [username, password, idClient], (err) => {
        if (err) {
          console.error("Eroare la inserarea în tabela utilizatori:", err);
          return res.status(500).json({ message: "Eroare la baza de date!" });
        }

        // Confirmare succes
        res.status(201).json({ message: "Cont creat cu succes!" });
      });
    }
  );
});

// Endpoint pentru obținerea tuturor utilizatorilor
app.get("/api/utilizatori", (req, res) => {
  // Interogare pentru obținerea listei de utilizatori cu detalii suplimentare
  const query = `
    SELECT u.id_utilizator, u.nume_utilizator, u.rol, 
           c.nume AS nume_client, c.prenume AS prenume_client,
           a.nume_complet AS nume_administrator
    FROM utilizatori u
    LEFT JOIN clienti c ON u.id_client = c.id_client
    LEFT JOIN administratori a ON u.id_administrator = a.id_administrator;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Eroare la preluarea utilizatorilor:", err);
      return res
        .status(500)
        .json({ message: "Eroare la preluarea utilizatorilor!" });
    }

    // Returnează lista utilizatorilor
    res.json(results);
  });
});

// Inserare utilizatori noi de către admini
app.post("/api/utilizatori", (req, res) => {
  const { username, parola, rol, nume, prenume, adresa, telefon, email, cnp } =
    req.body;

  // Validare câmpuri obligatorii
  if (!username || !parola || !rol || !nume) {
    return res
      .status(400)
      .json({ message: "Toate câmpurile sunt obligatorii!" });
  }

  if (rol === "client" && !cnp) {
    return res
      .status(400)
      .json({ message: "CNP-ul este obligatoriu pentru clienți!" });
  }

  if (rol === "client") {
    // Inserare în tabela 'clienti'
    const queryClient = `
      INSERT INTO clienti (nume, prenume, adresa, telefon, email, cnp)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      queryClient,
      [nume, prenume, adresa || null, telefon || null, email || null, cnp],
      (err, result) => {
        if (err) {
          console.error("Eroare la inserare client:", err);
          return res.status(500).json({ message: "Eroare la baza de date." });
        }

        const idClient = result.insertId; // Obține ID-ul clientului

        // Inserare în tabela 'utilizatori'
        const queryUtilizator = `
          INSERT INTO utilizatori (nume_utilizator, parola, rol, id_client)
          VALUES (?, ?, ?, ?)
        `;

        db.query(queryUtilizator, [username, parola, rol, idClient], (err) => {
          if (err) {
            console.error("Eroare la inserare utilizator:", err);
            return res.status(500).json({ message: "Eroare la baza de date." });
          }

          res.status(201).json({ message: "Client adăugat cu succes!" });
        });
      }
    );
  }
});

// Inserare utilizatori noi de tip administrator
app.post("/api/utilizatoriA", (req, res) => {
  const { username, parola, rol, nume, email, telefon, adresa, cnp } = req.body;

  // Validare câmpuri obligatorii
  if (!username || !parola || !rol || !nume || !email || !cnp) {
    return res
      .status(400)
      .json({ message: "Toate câmpurile sunt obligatorii!" });
  }

  if (rol === "administrator") {
    // Inserare în tabela 'administratori'
    const queryAdmin = `
      INSERT INTO administratori (nume_complet, email, telefon, adresa, cnp)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
      queryAdmin,
      [nume, email, telefon || null, adresa || null, cnp],
      (err, result) => {
        if (err) {
          console.error("Eroare la inserare administrator:", err);
          return res.status(500).json({ message: "Eroare la baza de date." });
        }

        const idAdmin = result.insertId; // Obține ID-ul administratorului

        // Inserare în tabela 'utilizatori'
        const queryUtilizator = `
          INSERT INTO utilizatori (nume_utilizator, parola, rol, id_administrator)
          VALUES (?, ?, ?, ?)
        `;

        db.query(queryUtilizator, [username, parola, rol, idAdmin], (err) => {
          if (err) {
            console.error("Eroare la inserare utilizator:", err);
            return res.status(500).json({ message: "Eroare la baza de date." });
          }

          res.status(201).json({ message: "Administrator adăugat cu succes!" });
        });
      }
    );
  } else {
    res.status(400).json({ message: "Rolul specificat este invalid." });
  }
});

app.post("/api/admin/assign-technician", (req, res) => {
  const { id_reparatie, id_tehnician } = req.body;

  // Query pentru asignarea tehnicianului
  const queryAssignTechnician = `
    INSERT INTO reparatii_tehnicieni (id_reparatie, id_tehnician)
    SELECT ?, ?
    WHERE EXISTS (
      SELECT 1 FROM reparatii WHERE id_reparatie = ? AND status = 'In asteptare'
    )
    AND EXISTS (
      SELECT 1 FROM tehnicieni WHERE id_tehnician = ?);
  `;

  db.query(
    queryAssignTechnician,
    [id_reparatie, id_tehnician, id_reparatie, id_tehnician],
    (err, result) => {
      if (err) {
        console.error("Eroare la asignarea tehnicianului:", err);
        return res.status(500).json({ message: "Eroare la baza de date!" });
      }

      if (result.affectedRows === 0) {
        return res
          .status(400)
          .json({ message: "Reparația nu există sau nu este 'în așteptare'!" });
      }

      // Query pentru actualizarea statusului reparației
      const queryUpdateStatus = `
        UPDATE reparatii
        SET status = 'In lucru'
        WHERE id_reparatie = ?;
      `;

      db.query(queryUpdateStatus, [id_reparatie], (err) => {
        if (err) {
          console.error("Eroare la actualizarea statusului reparației:", err);
          return res
            .status(500)
            .json({ message: "Eroare la actualizarea statusului!" });
        }

        res.json({
          message:
            "Tehnician asignat cu succes și statusul actualizat la 'In lucru'!",
        });
      });
    }
  );
});

// Endpoint pentru reparațiile cu statusul "în așteptare"
app.get("/api/admin/pending-repairs", (req, res) => {
  // Interogare pentru a obține lista reparațiilor cu statusul "În așteptare"
  const query = `
    SELECT r.id_reparatie, r.data, r.status, d.tip AS tip_dispozitiv, d.marca, d.model
    FROM reparatii r
    JOIN dispozitive d ON r.id_dispozitiv = d.id_dispozitiv
    WHERE r.status = 'In asteptare';
  `;

  // Execută interogarea în baza de date
  db.query(query, (err, results) => {
    if (err) {
      // În cazul unei erori SQL, loghează eroarea și returnează un răspuns cu cod 500
      console.error("Eroare la preluarea reparațiilor:", err);
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }

    // Returnează rezultatele interogării în format JSON
    res.json(results);
  });
});

// Endpoint pentru lista tehnicienilor
app.get("/api/admin/technicians", (req, res) => {
  // Interogare pentru a obține lista tuturor tehnicienilor
  const query = `
    SELECT id_tehnician, nume_tehnician, prenume_tehnician, specializare
    FROM tehnicieni;
  `;

  // Execută interogarea în baza de date
  db.query(query, (err, results) => {
    if (err) {
      // În cazul unei erori SQL, loghează eroarea și returnează un răspuns cu cod 500
      console.error("Eroare la preluarea tehnicienilor:", err);
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }

    // Returnează rezultatele interogării în format JSON
    res.json(results);
  });
});

app.get("/api/admin/repairs-with-services", (req, res) => {
  // Interogare pentru a obține reparațiile și serviciile asociate acestora, o subcerere care intoarce mai multe valori
  const query = `
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
  `;

  // Execută interogarea în baza de date
  db.query(query, (err, results) => {
    if (err) {
      // În cazul unei erori SQL, loghează eroarea și returnează un răspuns cu cod 500
      console.error("Eroare la preluarea reparațiilor cu servicii:", err);
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }

    // Returnează rezultatele interogării în format JSON
    res.json(results);
  });
});

// Interogare complexă cu subinterogare în SELECT
app.get("/api/admin/completed-repairs", (req, res) => {
  // Interogare pentru a obține reparațiile finalizate și costurile totale asociate fiecărei reparații
  const query = `
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
  `;

  // Execută interogarea în baza de date
  db.query(query, (err, results) => {
    if (err) {
      // În cazul unei erori SQL, loghează eroarea și returnează un răspuns cu cod 500
      console.error("Eroare la preluarea reparațiilor finalizate:", err);
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }

    // Returnează rezultatele interogării în format JSON
    res.json(results);
  });
});

// Definește un endpoint GET pentru a prelua lista clienților ordonată descrescător după numărul de dispozitive aduse la reparat
app.get("/api/admin/clienti-ordonati-dispozitive", (req, res) => {
  // Definirea interogării SQL
  const query = `
    SELECT 
        c.nume AS Nume, 
        c.prenume AS Prenume 
    FROM clienti c 
    ORDER BY (
        SELECT COUNT(d.id_dispozitiv) 
        FROM dispozitive d 
        WHERE d.id_client = c.id_client 
    ) DESC; 
  `;

  // Executarea interogării SQL utilizând conexiunea la baza de date
  db.query(query, (err, results) => {
    if (err) {
      // În cazul unei erori la interogare, loghează eroarea și trimite un răspuns cu codul de eroare 500 (Internal Server Error)
      console.error("Eroare la preluarea listei clienților:", err);
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }

    // Dacă interogarea se execută cu succes, returnează rezultatele ca răspuns JSON
    res.json(results);
  });
});

// Endpoint pentru obținerea listei de clienți care nu au adus dispozitive pentru reparații
app.get("/api/admin/clienti-fara-dispozitive", (req, res) => {
  const query = `
    SELECT c.nume, c.prenume
    FROM clienti c
    WHERE c.id_client NOT IN (
        SELECT d.id_client
        FROM dispozitive d
    );
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Eroare la preluarea clienților fără dispozitive:", err);
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }
    res.json(results);
  });
});

// Endpoint pentru clienții cu suma totală facturată mai mare decât media facturilor
app.get("/api/admin/clienti-peste-media-facturi", (req, res) => {
  const query = `
    SELECT c.nume, c.prenume, SUM(f.suma) AS suma_totala
    FROM clienti c
    JOIN facturi f ON c.id_client = f.id_client
    GROUP BY c.id_client, c.nume, c.prenume
    HAVING SUM(f.suma) > (SELECT AVG(suma) FROM facturi);
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(
        "Eroare la preluarea clienților cu facturi peste media:",
        err
      );
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }

    res.json(results);
  });
});

// Endpoint pentru obținerea reparațiilor "In lucru"
app.get("/api/admin/repairs-in-progress", (req, res) => {
  const query = `
    SELECT 
      r.id_reparatie,
      d.tip AS tip_dispozitiv,
      d.marca AS marca_dispozitiv,
      d.model AS model_dispozitiv,
      r.status
    FROM reparatii r
    JOIN dispozitive d ON r.id_dispozitiv = d.id_dispozitiv
    WHERE r.status = 'In lucru';
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Eroare la preluarea reparațiilor 'In lucru':", err);
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }

    res.json(results);
  });
});

// Endpoint pentru actualizarea statusului unei reparații la "Finalizat"
app.post("/api/admin/finalize-repair", (req, res) => {
  // Extrage ID-ul reparației din corpul cererii
  const { id_reparatie } = req.body;

  // Interogare SQL pentru actualizarea statusului reparației
  const queryUpdateStatus = `
    UPDATE reparatii
    SET status = 'Finalizata' 
    WHERE id_reparatie = ?  
    AND status = 'In lucru'; 
  `;

  // Execută interogarea SQL
  db.query(queryUpdateStatus, [id_reparatie], (err, result) => {
    // Dacă apare o eroare la baza de date
    if (err) {
      console.error("Eroare la actualizarea statusului reparației:", err);
      return res.status(500).json({ message: "Eroare la baza de date!" }); // Returnează eroare 500
    }

    // Verifică dacă a fost afectat vreun rând (adică dacă reparația există și era "In lucru")
    if (result.affectedRows === 0) {
      return res
        .status(400) // Returnează eroare 400 (cerere invalidă)
        .json({ message: "Reparația nu există sau nu este 'In lucru'!" });
    }

    // Dacă actualizarea a avut succes
    res.json({ message: "Reparația a fost actualizată la 'Finalizat'!" });
  });
});

// Endpoint pentru ștergerea unei reparații
app.delete("/api/admin/delete-repair/:id", (req, res) => {
  const { id } = req.params;

  // Pasul 1: Șterge înregistrările asociate din tabelul reparatii_servicii
  const queryDeleteServices = `
    DELETE FROM reparatii_servicii
    WHERE id_reparatie = ?;
  `;

  db.query(queryDeleteServices, [id], (err) => {
    if (err) {
      console.error(
        "Eroare la ștergerea serviciilor asociate reparației:",
        err
      );
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }

    // Pasul 2: Șterge reparația după ce serviciile asociate au fost eliminate
    const queryDeleteRepair = `
      DELETE FROM reparatii
      WHERE id_reparatie = ? AND status = 'In asteptare';
    `;

    db.query(queryDeleteRepair, [id], (err, result) => {
      if (err) {
        console.error("Eroare la ștergerea reparației:", err);
        return res.status(500).json({ message: "Eroare la baza de date!" });
      }

      if (result.affectedRows === 0) {
        return res
          .status(400)
          .json({ message: "Reparația nu există sau nu este 'In asteptare'!" });
      }

      // Reparația și serviciile asociate au fost șterse cu succes
      res.json({
        message: "Reparația și serviciile asociate au fost șterse cu succes!",
      });
    });
  });
});
// Enpoint pentru preluarea tehncienilor inactivi
app.get("/api/admin/inactive-technicians", (req, res) => {
  const query = `
    SELECT t.id_tehnician, t.nume_tehnician, t.prenume_tehnician, t.specializare
    FROM tehnicieni t
    WHERE t.id_tehnician NOT IN (
      SELECT DISTINCT id_tehnician FROM reparatii_tehnicieni
    );
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Eroare la preluarea tehnicienilor inactivi:", err);
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }

    res.json(results);
  });
});

// Endpoint pentru ștergerea unui tehnician inactiv
app.delete("/api/admin/delete-technician/:id", (req, res) => {
  const { id } = req.params;

  // Pasul 1: Șterge înregistrările asociate din tabelul reparatii_tehnicieni
  const queryDeleteTechnicianReferences = `
    DELETE FROM Reparatii_Tehnicieni
    WHERE id_tehnician = ?;
  `;

  db.query(queryDeleteTechnicianReferences, [id], (err) => {
    if (err) {
      console.error(
        "Eroare la ștergerea referințelor tehnicianului din Reparatii_Tehnicieni:",
        err
      );
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }

    // Pasul 2: Șterge tehnicianul după ce referințele asociate au fost eliminate
    const queryDeleteTechnician = `
      DELETE FROM Tehnicieni
      WHERE id_tehnician = ? AND id_tehnician NOT IN (
        SELECT DISTINCT id_tehnician FROM Reparatii_Tehnicieni
      );
    `;

    db.query(queryDeleteTechnician, [id], (err, result) => {
      if (err) {
        console.error("Eroare la ștergerea tehnicianului:", err);
        return res.status(500).json({ message: "Eroare la baza de date!" });
      }

      if (result.affectedRows === 0) {
        return res.status(400).json({
          message: "Tehnicianul nu există sau este asociat cu reparații!",
        });
      }

      // Tehnicianul și referințele asociate au fost șterse cu succes
      res.json({
        message:
          "Tehnicianul și referințele asociate au fost șterse cu succes!",
      });
    });
  });
});

// Endpoint pentru afișarea serviciilor și numărul total de clienți care le-au ales
app.get("/api/admin/services-clients", (req, res) => {
  const query = `
    SELECT 
      s.denumire AS Serviciu, 
      COUNT(DISTINCT c.id_client) AS NrClienti
    FROM servicii s
    JOIN reparatii_servicii rs ON s.id_serviciu = rs.id_serviciu
    JOIN reparatii r ON rs.id_reparatie = r.id_reparatie
    JOIN dispozitive d ON r.id_dispozitiv = d.id_dispozitiv
    JOIN clienti c ON d.id_client = c.id_client
    GROUP BY s.id_serviciu, s.denumire
    ORDER BY NrClienti DESC;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Eroare la preluarea serviciilor și clienților:", err);
      return res.status(500).json({ message: "Eroare la baza de date!" });
    }

    res.json(results);
  });
});
