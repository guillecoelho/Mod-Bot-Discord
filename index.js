const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

//Importo archivos necesarios
let prefix = config.prefix;
const filter = require('./filter.js');

//Cuando el bot esta listo para funcionar
client.on('ready', () => {
	console.log(`Estoy listo!`);

	client.user.setPresence({
		activity: {
			name: `bo!help | give me a hug :)`,
			type: 'WATCHING',
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
	if (message.author.bot) return;

	if (
		filter.words.some((p) => message.content.toLowerCase().includes(p.word))
	) {
		let reply = filter.words.find((e) =>
			message.content.toLowerCase().includes(e.word)
		);
		message.channel.send(reply.message);
	}

	//Obtener los comandos de un mensaje
	const args = message.content.slice(prefix.length).trim().split(/ +/g);
	const command = args.shift().toLowerCase();

	//Evitar bucles con prefijos
	if (!message.content.startsWith(prefix)) return;

	//-----> COMANDOS <------
	//Prueba de log
	if (command == 'log') {
		message.client.channels.cache.get(config.logChannel).send('Funca');
	}

	//Lista de ayuda
	if (command == 'help') {
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
	}
});

client.on('disconnect', () => {
	// Tiempo de desconexión
	let today = new Date();
	let date =
		today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
	let time =
		today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();

	// Enviamos un mensaje de información de la desconexión en un canal X
	client.channels.cache
		.get(config.logChannel)
		.send(`[${date}][${time}]: Bot se ha desconectado.`);

	// Por consola
	console.log(`[${date}][${time}]: Bot se ha desconectado.`);
});

client.login(config.token);

client.on('error', (e) => console.error(e));
client.on('warn', (e) => console.warn(e));
client.on('debug', (e) => console.debug(e));
