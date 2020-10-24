const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');

//Para la reproduccion de musica
const ytdl = require('ytdl-core');
const search = require('youtube-search');
const queue = new Map(); // Cola de reproduccion

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
client.on('message', async (message) => {
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

	//Reproducir musica
	// Esta constante 'serverQueue' nos permitira saber si un servidor tiene una lista de musica reproduciendo.
	const serverQueue = queue.get(message.guild.id);

	// <-- CODIGO CMD PLAY (REPRODUCIR): -->
	if (command === 'play') {
		execute(message, serverQueue);
		return;
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

// Verificar
async function execute(message, serverQueue) {
	const args = message.content.split(' ');

	//verificamos que el usuario solicitante este conectado en un canal de voz.
	const voiceChannel = message.member.voice.channel;
	if (!voiceChannel)
		return message.channel.send(
			'¡Necesitas unirte a un canal de voz para reproducir música!'
		);

	//verificamos que el bot tenga permisos de conectar y de hablar en el canal de voz.
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send(
			'¡Necesito permisos para unirme y hablar en el canal de voz!'
		);
	}

	// <-- Capturamos la información de la música a reproducir -->

	var opts = {
		maxResults: 1, //Maximo de resultados a encontrar
		key: config.apiyt, //Necesitas una CLAVE de la API de youtube.
		type: 'video', // Que tipo de resultado a obtener.
	};

	const songArg = await search(args.join(' '), opts);
	const songURL = songArg.results[0].link;
	const songInfo = await ytdl.getInfo(songURL);

	const song = {
		title: songInfo.title,
		url: songInfo.video_url,
		author: message.author.tag,
	};

	// <-- Verificamos la lista de canciones de un servidor -->

	// Creating the contract for our queue
	const queueContruct = {
		textChannel: message.channel,
		voiceChannel: voiceChannel,
		connection: null,
		songs: [],
		volume: 5,
		playing: true,
	};
	// Setting the queue using our contract
	queue.set(message.guild.id, queueContruct);
	// Pushing the song to our songs array
	queueContruct.songs.push(song);

	try {
		// Here we try to join the voicechat and save our connection into our object.
		var connection = await voiceChannel.join();
		queueContruct.connection = connection;
		// Calling the play function to start a song
		play(message.guild, queueContruct.songs[0]);
	} catch (err) {
		// Printing the error message if the bot fails to join the voicechat
		console.log(err);
		queue.delete(message.guild.id);
		return message.channel.send(err);
	}
}

//Funcion de reproducir
function play(guild, song) {
	const serverQueue = queue.get(guild.id);
	// verificamos que hay musica en nuestro objeto de lista
	if (!song) {
		serverQueue.voiceChannel.leave(); // si no hay mas música en la cola, desconectamos nuestro bot
		queue.delete(guild.id);
		return;
	}
	// <-- Reproducción usando play()  -->

	const dispatcher = serverQueue.connection
		.play(ytdl(song.url))
		.on('finish', () => {
			// Elimina la canción terminada de la cola.
			serverQueue.songs.shift();

			// Llama a la función de reproducción nuevamente con la siguiente canción
			play(guild, serverQueue.songs[0]);
		})
		.on('error', (error) => {
			console.error(error);
		});
	// Configuramos el volumen de la reproducción de la canción
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	serverQueue.textChannel.send(`Reproduciendo: **${song.title}**`);
}
