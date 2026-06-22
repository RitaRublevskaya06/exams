const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('Lab14PSKP', 'USER_LAB14', '1111', {
  host: 'VIVO',
  dialect: 'mssql',
  dialectModule: require('tedious'),
  pool: {
    max: 10,
    min: 0,
    idle: 30000
  },
  dialectOptions: {
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  },
  define: {
    timestamps: false
  },
  logging: false
});

const Faculty = sequelize.define('FACULTY', {
  FACULTY: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  FACULTY_NAME: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'FACULTY'
});

const Pulpit = sequelize.define('PULPIT', {
  PULPIT: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  PULPIT_NAME: {
    type: DataTypes.STRING(100)
  },
  FACULTY: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'PULPIT'
});

const Subject = sequelize.define('SUBJECT', {
  SUBJECT: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  SUBJECT_NAME: {
    type: DataTypes.STRING(50)
  },
  PULPIT: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'SUBJECT'
});

const Teacher = sequelize.define('TEACHER', {
  TEACHER: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  TEACHER_NAME: {
    type: DataTypes.STRING(100)
  },
  PULPIT: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'TEACHER'
});

const AuditoriumType = sequelize.define('AUDITORIUM_TYPE', {
  AUDITORIUM_TYPE: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  AUDITORIUM_TYPENAME: {
    type: DataTypes.STRING(30)
  }
}, {
  tableName: 'AUDITORIUM_TYPE'
});

const Auditorium = sequelize.define('AUDITORIUM', {
  AUDITORIUM: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  AUDITORIUM_NAME: {
    type: DataTypes.STRING(200)
  },
  AUDITORIUM_CAPACITY: {
    type: DataTypes.INTEGER
  },
  AUDITORIUM_TYPE: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'AUDITORIUM'
});

Faculty.hasMany(Pulpit, { foreignKey: 'FACULTY' });
Pulpit.belongsTo(Faculty, { foreignKey: 'FACULTY', as: 'FacultyRef' });

Pulpit.hasMany(Subject, { foreignKey: 'PULPIT' });
Subject.belongsTo(Pulpit, { foreignKey: 'PULPIT', as: 'PulpitRef' });

Pulpit.hasMany(Teacher, { foreignKey: 'PULPIT' });
Teacher.belongsTo(Pulpit, { foreignKey: 'PULPIT', as: 'PulpitTeacherRef' });

AuditoriumType.hasMany(Auditorium, { foreignKey: 'AUDITORIUM_TYPE' });
Auditorium.belongsTo(AuditoriumType, { foreignKey: 'AUDITORIUM_TYPE', as: 'AuditoriumTypeRef' });

module.exports = {
  sequelize,
  Faculty,
  Pulpit,
  Subject,
  Teacher,
  AuditoriumType,
  Auditorium
};

