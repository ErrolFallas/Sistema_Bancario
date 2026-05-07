// ============================================
// Modelo: Cuenta
// Tabla: CUENTAS
// ============================================

const { DataTypes } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const Cuenta = sequelize.define('Cuenta', {
    idCuenta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_cuenta',
    },
    numeroCuenta: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'numero_cuenta',
      validate: {
        notEmpty: { msg: 'El número de cuenta es obligatorio' },
      },
    },
    saldo: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: { args: [0], msg: 'El saldo no puede ser negativo' },
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
    },
    fechaApertura: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: 'fecha_apertura',
    },
    idBanco: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_banco',
      references: {
        model: 'BANCOS',
        key: 'id_banco',
      },
    },
    idTipoCuenta: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'id_tipo_cuenta',
      references: {
        model: 'TIPOS_CUENTA',
        key: 'id_tipo_cuenta',
      },
    },
  }, {
    tableName: 'CUENTAS',
    timestamps: true,
    underscored: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  // ============================================
  // Funciones Auxiliares: IBAN Bancario
  // ============================================
  
  // Convierte letras a números según el estándar IBAN (A=10, B=11... Z=35)
  const letraANumero = (letra) => (letra.charCodeAt(0) - 55).toString();

  // Generador de IBAN Simplificado con Checksum (Módulo 97)
  const generarIBAN = (codigoBancoCompleto) => {
    // 1. Extraer 3 primeras letras del banco (Ej: "NEX-CR-001" -> "NEX")
    const prefijoBanco = (codigoBancoCompleto || 'BCO').substring(0, 3).toUpperCase();
    
    // 2. Generar 14 dígitos numéricos aleatorios (Seguridad criptográfica)
    let cuentaNumerica = '';
    while (cuentaNumerica.length < 14) {
      cuentaNumerica += crypto.randomInt(0, 10).toString();
    }
    
    // 3. Construir BBAN (Basic Bank Account Number): 0 + prefijo + 14 dígitos
    const bban = `0${prefijoBanco}${cuentaNumerica}`;
    
    // 4. Preparar cadena para calcular Checksum (Módulo 97): BBAN + CR00
    const cadenaCalculo = `${bban}CR00`;
    
    // 5. Reemplazar todas las letras por su valor numérico
    let numeroParaCalculo = '';
    for (let char of cadenaCalculo) {
      if (/[A-Z]/.test(char)) {
        numeroParaCalculo += letraANumero(char);
      } else {
        numeroParaCalculo += char;
      }
    }
    
    // 6. Calcular Checksum (Módulo 97) usando BigInt nativo de JS
    const modulo = BigInt(numeroParaCalculo) % 97n;
    const checkDigits = (98n - modulo).toString().padStart(2, '0');
    
    // 7. Retornar IBAN final con formato legible cada 4 caracteres
    // Ejemplo: CR88-0NEX-1234-5678-9012-34
    const ibanPlano = `CR${checkDigits}${bban}`;
    return ibanPlano.match(/.{1,4}/g).join('-');
  };

  // ============================================
  // Hooks
  // ============================================

  Cuenta.beforeValidate(async (cuenta, options) => {
    // Solo generar si es un registro nuevo y no trae número de cuenta
    if (cuenta.isNewRecord && !cuenta.numeroCuenta) {
      
      // 1. Obtener código real del Banco para el prefijo
      let codigoBanco = 'BCO';
      if (cuenta.idBanco && sequelize.models.Banco) {
        const banco = await sequelize.models.Banco.findByPk(cuenta.idBanco, {
          transaction: options.transaction // Mantener integridad de transacciones
        });
        if (banco && banco.codigo) {
          codigoBanco = banco.codigo;
        }
      }

      // 2. Intentar generar un IBAN sin colisiones
      let esUnico = false;
      let intentos = 0;
      const MAX_INTENTOS = 5;

      while (!esUnico && intentos < MAX_INTENTOS) {
        const posibleIban = generarIBAN(codigoBanco);
        
        // Verificar en BD si ya existe
        const cuentaExistente = await Cuenta.findOne({ 
          where: { numero_cuenta: posibleIban },
          transaction: options.transaction
        });

        if (!cuentaExistente) {
          cuenta.numeroCuenta = posibleIban;
          esUnico = true;
        }
        
        intentos++;
      }

      if (!esUnico) {
        throw new Error('Error crítico: No se pudo generar un IBAN único después del límite de intentos.');
      }
    }
  });

  return Cuenta;
};
