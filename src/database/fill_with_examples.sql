
INSERT INTO Users (Public_Key, Private_Key, Email)
VALUES ('0x1c663755c0b6A1477fDc8a383928a5806398f6C8', '0x27272828282828282', 'user1@example.com');

INSERT INTO Admin (Email, Pswd, Creditos)
VALUES ('admin1@example.com', 'password123', 100);

-- Assuming there's an Admin with Admin_ID=1 from the previous insertion
INSERT INTO Collections (Admin_ID, nombre_de_la_Coleccion, Chain_Id, Supply, Imagen, Metadata)
VALUES (1, 'Coleccion de Vinos', '0xETHoMATIC', 200, 'ruta al aerweave1', 'ruta a la metadata');

-- Assuming there's a User with Wallet_ID=1 and a Collection with Id_Coleccion=1
INSERT INTO NFTs (Id_Coleccion, uuid_correspondiente, claimed, Owner)
VALUES (1, '4468fd6sample', FALSE, 1);