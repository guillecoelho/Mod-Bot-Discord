const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

let prefix = config.prefix;

//Cuando el bot esta listo para funcionar
client.on('ready', () => {
	console.log(`Estoy listo!`);

	client.user.setPresence({
		activity: {
			name: `bo!help | give me a hug :)`,
			type: 'PLAYING',
		},
		status: 'online',
	});
});

//Miembros nuevos
client.on('guildMemberAdd', (member) => {});

//Miembros que se van
client.on('guildMemberRemove', (member) => {});

//Funciones con mensajes
client.on('message', (message) => {
	//Evitar bucle infinito
	if (!message.content.startsWith(prefix)) return;
	if (message.author.bot) return;

	//Obtener los comandos de un mensaje
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	//-----> COMANDOS <------

	//Lista de ayuda
	const embedDatos = new Discord.MessageEmbed()
		.setTitle('Has pedido mi ayuda, aqui vengo a por tu rescate')
		.setAuthor(message.author.username, message.author.displayAvatarURL())
		.setColor('#f67766')
		.setDescription(
			'Aqui te dejo una serie de comandos que puedes utilizar conmigo'
		)
		.setFooter('No dudes en llamarme otra vez', client.user.avatarURL())
		.setImage(message.author.displayAvatarURL())
		.setThumbnail(message.author.displayAvatarURL())
		.setTimestamp()
		.setURL('https://github.com/ElBoDeLaJusticia')
		.addField('Comandos:', 'xd tengo que pensarlos');

	message.channel.send({ embed: embedDatos });

	if (command == 'ping') {
		message.channel.send(`pong 🏓!!`);
	}
});

client.login(config.token);

client.on('error', (e) => console.error(e));
client.on('warn', (e) => console.warn(e));
client.on('debug', (e) => console.info(e));
