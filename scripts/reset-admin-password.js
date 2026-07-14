require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const nueva_contraseña = process.argv[2];
const email = process.argv[3];

if (!nueva_contraseña || !email) {
  console.error('Uso: npm run reset-admin-password -- <contraseña> <email>');
  process.exit(1);
}

(async () => {
  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const contraseña_hasheada = await bcrypt.hash(nueva_contraseña, 12);
  const [resultado] = await conexion.execute(
    'UPDATE Administradores SET contraseña = ? WHERE email = ?',
    [contraseña_hasheada, email.trim()],
  );

  if (resultado.affectedRows === 0) {
    console.error('No se encontró un administrador con ese email.');
    process.exit(1);
  }

  console.log('Contraseña actualizada correctamente.');
  await conexion.end();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
