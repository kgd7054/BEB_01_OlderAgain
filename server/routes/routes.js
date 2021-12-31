const express = require('express');
const router = express.Router();
const signUpTemplateCopy = require('../models/SignupModels');
const contentsTemplateCopy = require('../models/ContentsModels');
const mongoose = require('mongoose');
const Web3 = require('web3');
const { erc20Abi, erc721Abi } = require('../abi');
const erc20Addr = require('../erc20Addr');
const erc721Addr = require('../erc721Addr');
const serverAddress = '0xa96A7BA2ECD32760dD11b640EE2c6090B5Da81c6'; // ganache 0번 계정
const serverPrivateKey =
	'e606fcf5df6b7f16d6ba3dc9f097dbe01611247dad86a8667baaf78715fec6be'; // ganache 0번 계정

router.post('/signup', (req, res) => {
	const { username, password } = req.body;
	signUpTemplateCopy.findOne({ username: username }, (err, user) => {
		if (user) {
			res.send({ message: 'User already registered' });
		} else {
			const user = new signUpTemplateCopy({
				username,
				password,
			});

			user.save((err) => {
				if (err) {
					res.send(err);
				} else {
					res.send({
						message: 'Successfully Registered, Please login now.',
					});
				}
			});
		}
	});
});

/* router.post('/signup', (req, res) => {
	const signedUpUser = new signUpTemplateCopy({
		username: req.body.username,
		password: req.body.password,
	});

	signedUpUser
		.save()
		.then((data) => {
			res.json(data);
		})
		.catch((error) => {
			res.json(err);
		});
}); */

router.post('/login', (req, res) => {
	const { username, password } = req.body;
	signUpTemplateCopy.findOne({ username: username }, (err, user) => {
		if (user) {
			if (password === user.password) {
				res.send({ message: 'Login Successful', user: user });
			} else {
				res.send({ message: "Password didn't match" });
			}
		} else {
			res.send({ message: 'User not registered' });
		}
	});
});

router.get('/contentList', (req, res) => {
	try {
		contentsTemplateCopy.find({}, (e, result) => {
			res.json(result);
		});
	} catch (e) {
		res.json(e);
	}
});

router.post('/write', async (req, res) => {
	const contentsWrite = new contentsTemplateCopy({
		title: req.body.title,
		username: req.body.username,
		address: req.body.address,
		content: req.body.content,
	});

	const web3 = await new Web3(
		new Web3.providers.HttpProvider('http://127.0.0.1:7545')
	);
	web3.eth.accounts.wallet.add(serverPrivateKey);
	const ercContract = new web3.eth.Contract(erc20Abi, erc20Addr);

	contentsWrite
		.save()
		.then((data) => {
			// 디비 저장 후 프론트에 응답 후 블록체인 통신 (tx : sign,send transaction => send)
			ercContract.methods
				.transfer(req.body.address, web3.utils.toWei('1', 'ether'))
				.send(
					{ from: serverAddress, gasprice: 100, gas: 100000 },
					(err, res) => {
						console.log(res);
					}
				);
			res.json(data);
		})
		.catch((err) => {
			res.json(err);
		});
});

// server 계정(ganache 0번 계정) erc20(OAT) 토큰 받기
router.get('/tokenfaucet', async (req, res) => {
	const web3 = new Web3(
		new Web3.providers.HttpProvider('http://127.0.0.1:7545')
	);
	web3.eth.accounts.wallet.add(serverPrivateKey);
	const ercContract = new web3.eth.Contract(erc20Abi, erc20Addr);
	await ercContract.methods
		.mintToken(serverAddress, web3.utils.toWei('10', 'ether'), erc721Addr)
		.send(
			{ from: serverAddress, gasprice: 100, gas: 100000 },
			(err, res) => {
				console.log(res);
			}
		);
});

module.exports = router;
