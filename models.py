from peewee import SqliteDatabase, Model, TextField, ForeignKeyField, BlobField

db = SqliteDatabase('db.db')


class Table(Model):
    
    class Meta:
        database = db


class MetalType(Table):
    name = TextField()


class Brand(Table):
    name = TextField()


class ProductType(Table):
    name = TextField()


class ProductSubtype(Table):
    name = TextField()
    product_type = ForeignKeyField(ProductType)


class Product(Table):
    product_subtype = ForeignKeyField(ProductSubtype)
    brand = ForeignKeyField(Brand)
    metal_type = ForeignKeyField(MetalType)


class Template(Table):
    json = TextField(null=True)
    imagemagick = TextField(null=True)


class Image(Table):
    content = BlobField()

class DoneImage(Table):
    path = TextField()
    product = ForeignKeyField(Product)
    template = ForeignKeyField(Template)


db.connect()
db.create_tables([MetalType, Brand, ProductType, ProductSubtype, Product, Template, Image])
db.close()