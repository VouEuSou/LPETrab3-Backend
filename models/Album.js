import { DataTypes } from 'sequelize';
import { sequelize } from '../databases/conecta.js';
import { Usuario } from './Usuario.js'

export const Album = sequelize.define('album', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  data: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  preco: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  artista: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  genero: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  capa: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  qtde_notas: {
    type: DataTypes.INTEGER(6),
    defaultValue: 0
  },
  total_notas: {
    type: DataTypes.INTEGER(6),
    defaultValue: 0
  },
  staffpicks: {
    type: DataTypes.BOOLEAN,
    defaultValue: 0
  },
  media_notas: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0
  },
}, {
  paranoid: true
});

Album.belongsTo(Usuario, {
  foreignKey: {
    name: 'usuario_id',
    allowNull: false
  },
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
})

Usuario.hasMany(Album, {
  foreignKey: 'usuario_id'
})

Album.beforeUpdate(album => {
  album.media_notas = album.total_notas / album.qtde_notas
});