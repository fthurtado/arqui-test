# IIC2173 - E1 - Servicios de valores interdimensionales

## Objetivo

La entrega está intencionada para que creen un diseño sólido de una aplicación transaccional (un broker + registro bursátil), con miras a ser implementada en la nube. Además, se les piden diversos requerimientos no funcionales explícitos para la aplicación.

## Enunciado 



En una búsqueda por expandir sus fronteras, *LegitBusiness* los contrató para entrar en un mercado sumamente lucrativo: el mercado bursátil. Dadas las capacidades de *LegitBusiness* para contactarse y ofrecer internet a diferentes dimensiones, han identificado una oportunidad de negocio: representar a las bolsas de valores de diferentes mundos de estas dimensiones e introducir el concepto de bolsa de valores, en específico la bolsa para instrumentos de renta variable, las acciones.

<center><img src="https://static.wikia.nocookie.net/memes-pedia/images/d/df/Nada.png/revision/latest?cb=20201119214705&path-prefix=es" alt="stonks" width="500"/></center><br>

Dado que muchos de esos mundos están muy atrasados en temas tecnológicos pero se manejan en base a algún sistema monetizado (billetes, monedas de oro, balas, créditos, etc) y poseen industrias de diverso tipo, se puede introducir el concepto de bolsa de valores. En estos lugares, de forma muy sencilla las empresas ofrecen sus acciones en una cantidad inicial a cierto precio  y luego estas se transan a nuevos clientes y posteriormente entre ellos. Las acciones son porcentajes de propiedad de las empresas que pueden generar dividendos, ganancias que se reparten entre los accionistas, la gente que posee estas acciones.

Además, la gente hace compraventa de acciones públicas de estas empresas. Ponen órdenes de venta para que apenas alguien quiera comprar a un precio favorable superior a cierto precio mínimo que fija el vendedor, se ejecute la operación. Las órdenes de compra son similares pero esperan un precio inferior o igual al que fija el comprador.

## Ejemplo

Suponga que existe una empresa en el mundo de la Tierra Media llamada Gondor Dwarf Weapons Inc, que produce balistas capaces de aniquilar orcos con precisión a 1200m, más del doble de una balista convencional romana. Necesitan financiación y ofrecen 40% de su empresa en la bolsa a 5 monedas de oro por 1 acción, que representa un 0.01% de la propiedad de la empresa. Esto genera un total de 4000 acciones a transar, con una entrada de capital de 20000 monedas de oro, lo suficiente para expandirse al mundo de los onagros. Posteriormente, las personas, según los resultados de las empresas podrán comprar o vender a un precio diferente

## Especificaciones

### Requisitos funcionales

Se les pide que realicen una plataforma (Nombre a discreción de ustedes) capaz de ofrecer la experiencia de la bolsa a las empresas que se ofrecen y los clientes. Estos servicios están divididos en:

* **RF1 (0.5)** IPO: Una empresa puede ofrecer sus acciones a la bolsa para ser compradas y recibir ese capital, en una billetera de la empresa
* **RF2 (0.5)** Órdenes de compra: Son posiciones que adoptan los clientes para comprar acciones, en espera a una posibilidad de venta favorable
* **RF3 (0.5)** Órdenes de venta: Posiciones de venta de acciones, esperando a una oportunidad de compra favorable

Cada persona y empresa debe tener 

* **RF4 (0.5)** Ingresos de fondos: cada persona debe ser capaz de cargar una billetera con fondos en su moneda local, para comprar acciones. 
* **RF5 (0.5)** Una billetera y un registro de transacciones: Donde se pueda ver las transacciones históricas de cada uno
* **RF6 (0.5)** Capacidad para ejecutar las transacciones correctamente en la interfaz.

### Requisitos no funcionales

Como RNF, les pidieron lo siguiente

* **RNF1 (0.8)**: (Irremplazable / Requisito para revisar) Deben usar un formato de Backend-Frontend separado: una API con respuestas JSON, usando REST o GraphQL y un frontend. Esto es muy importante puesto que es crítico para las siguientes entregas. Usen un combo como Koa-React, Express-Flutter, FastAPI-Vue o cualquier otra combinación que les acomode.
* **RNF1 (0.3)**: Su aplicación/aplicaciones backend deben estar en un container docker, cada una.
* **RNF1 (0.4)**: Capacidad de revisión de órdenes en "tiempo real" (5 segundos es suficiente)
* **RNF1 (0.4)**: Ejecución de órdenes de compraventa cada 5 segundos, por orden de cantidad (va primero aquella que ofrezca más x acción y que calce con la cantidad de acciones que hay)
* **RNF1 (0.4)**: Transaccionalidad en las operaciones de billetera (no doble pago y otras aberraciones)
* **RNF1 (0.3)**: Usar una API Gateway para recibir y rutear los requests. No es necesario que describan todos los endpoints en el Gateway, pero si que pasen por ahí. Tampoco es necesario ahora que la API registre el uso de Tokens, pero a futuro si
* **RNF1 (0.4)** Adicionalmente, se les pide que realicen un diagrama de componentes UML donde puedas modelar previamente su solución

#### Opcionales
(+0.1 a +1.0) Pueden añadir un RNF que ustedes crean pertinente, previa consulta a los ayudantes. Este nivel de puntaje puede variar y reemplazar alguno de los requisitos anteriores

(+0.3) Opcionalmente, pueden montar un pipe de CI/CD. Esta vez no es obligatorio, pero tiene un bonus asociado de 3 décimas y la posibilidad de adelantarlo (se pedirá como RNF en la siguiente entrega). Se hará/subirá una ayudantía sobre el tema.

## Recomendaciones

* Comiencen la entrega lo antes posible, puesto que es mas sencillo ir trabajando de a partes y seguro tendrán dudas
* Planifiquen con antelación: pregunten dudas o ambigüedades a sus ayudantes
* Ojo con los deploys a última hora, la maldición de la demo es muy real
* En caso que hagan el bonus CI/CD, asignen a dos personas a setear un pipeline: es sumamente útil para reflejar inmediatamente su trabajo
* Ocupen el Free Tier de AWS, que tiene capacidad para todas estos requerimientos. Deberían usar los siguientes servicios:
	* **EC2**: AWS les proporciona una instancia t2.micro gratuita al mes
	* **S3**: Tienen 5 GB de almacenamiento y 20000 solicitudes GET
	* **RDS** (Opcional, Recomendado): Tienen 20GB y una instancia básica al mes
	* **API Gateway**: 1 MM de llamadas al mes
	* **Lambda (Opcional)**: Tienen 400K GB/s y 1 MM de solicitudes.
	* **EBS**: 30 GB al mes para almacenamiento de discos de sistema
	* **Cloudfront**: 50 GB al mes de transferencia
	* **Amazon SES**: 62000 mensajes salientes / mes
* Usen una cuenta nueva o de alguien que no tenga otras cargas en AWS, para evitar cargos por ahora, además de usar una tearjeta prepago y los budget alerts de AWS

Eventualmente, lograremos un convenio con AWS para obtener créditos y labs más avanzados pero el free tier bastará. De preferencia, hagan funcionar la app localmente y luego la van subiendo a AWS.


## Entrega

Se les dará un repositorio grupal para su entrega backend, y se les facilitará otro posteriormente para frontend.

Deben entregar en un buzón en canvas un archivo con lo siguiente
Archivo PEM de los servidores y sus direcciones
Credenciales con los permisos suficientes para revisar que su app esté corriendo. 
Instrucciones para acceder a los servidores

Además, deberán exponer sus resultados en una demo de 10-20 minutos explicando su entrega y mostrando sus logros. Se les abrirá un link para que puedan agendar con los ayudantes asignados a su equipo

## Puntaje

### Grupal

La nota se calcula como:

**E<sub>1</sub> = 1 + E<sub>1 RF</sub> + E<sub>1 RNF</sub>**

### Individual

Segun el programa del curso, esto se evalua como:

**E<sub>1</sub> = 1 + ((E<sub>1 grupal</sub> - 1) * F<sub>g</sub>)**			

Donde F<sub>g</sub> es un factor de coevaluación asignado por el grupo que va de 0 a 1.2. Para esto se enviará un form de coevaluación donde cada integrante deberá evaluar a sus compañeros de grupo con una puntuación entre 1 y 5. 

**No podrán asignarle 5 puntos a más de un compañero, y sí lo hacen, se considerará que se entregó un máximo de 4 puntos a cada compañero**.

De no realizar la coevaluación, asumiremos que se le entregó el mismo puntaje de coevaluación a cada integrante, es decir 4 puntos.

## Apoyo

Pueden usar el discord del curso para dudas más rápidas
Las ayudantías programadas relevantes para esto por ahora son:

* API gateway / Lambda
* Flutter básico (más adelante se les pedirá una app muy sencilla)
* CI/CD

Se les avisará con antelación cuándo son y si habrá más.

## Documentación sugerida

* Mankiw, N. G. (2016). Principles of microeconomics (8th ed.). CENGAGE Learning Custom Publishing
* https://es.wikipedia.org/wiki/Acci%C3%B3n_(finanzas)
* 
