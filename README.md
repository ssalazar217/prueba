Servidor de prueba: http://stese.ml

Requisitos del proyecto:
Net Core 3.1
SQL Server

# Para clonar:
git clone https://github.com/ssalazar217/prueba.git

# Restaurar dependencias
cd prueba\prueba
dotnet restore

# Para modificar la ruta a la base de datos modificar el archivo 'appsettings.json' que se encuentra en la carpeta 'prueba\prueba'.
# Colocar la cadena de conexion que utilizara la base de datos nueva.
"ContextConnection": "Server=(localdb)\\mssqllocaldb;Database=prueba;Trusted_Connection=True;MultipleActiveResultSets=true"

# Una vez configurada la informacion de la base de datos escribimos el siguiente comando para restaurarla
dotnet ef database update

# Ejecutamos el proyecto
dotnet run
