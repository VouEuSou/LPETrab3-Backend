import { DataTypes } from 'sequelize';
import { sequelize } from '../databases/conecta.js';
import { Album } from './Album.js';

export const Avaliacao = sequelize.define('avaliacao', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  comentario: {
    type: DataTypes.STRING(255),
  },
  nota: {
    type: DataTypes.INTEGER(2),
    allowNull: false
  }
}, {
  tableName: "avaliacoes"
});

Avaliacao.belongsTo(Album, {
  foreignKey: {
    name: 'album_id',
    allowNull: false
  },
  onDelete: 'RESTRICT',
  onUpdate: 'RESTRICT'
})

Album.hasMany(Avaliacao, {
  foreignKey: 'album_id'
})
