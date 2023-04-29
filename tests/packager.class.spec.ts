import { mkdir, rmdir, unlink } from 'fs';

import { expect } from 'chai';

import { Helper, Option, Packager } from '../src';
import { Package } from '../src/packager.interface';
import { Range } from '../src/option.type';

describe('packager', () =>
{
	let helper : Helper;
	let option : Option;
	let packager : Packager;

	beforeEach(() =>
	{
		helper = new Helper();
		option = new Option(helper);
		packager = new Packager(option);
	});

	it('read object from package file', done =>
	{
		option.init(
		{
			path: 'tests/provider/01'
		});
		packager
			.readFileAsync()
			.then(content => helper.parseJson(content.toString()))
			.then((packageObject : Package) =>
			{
				expect(packageObject).to.have.property('name');
				expect(packageObject).to.have.property('version');
				expect(packageObject).to.have.property('dependencies');
				expect(packageObject).to.have.property('devDependencies');
				expect(packageObject).to.have.property('lintDependencies');
				expect(packageObject).to.have.property('testDependencies');
				done();
			})
			.catch(() => done('error'));
	});

	it('write object to package file', done =>
	{
		option.init(
		{
			path: 'tests/provider/00'
		});
		mkdir('tests/provider/00', () =>
		{
			packager.writeFileAsync(helper.stringifyObject(
			{
				name: 'test',
				version: '1.0.0'
			}))
			.then(() =>
			{
				packager
					.readFileAsync()
					.then(content => helper.parseJson(content.toString()))
					.then((packageObject : Package) =>
					{
						expect(packageObject).to.have.property('name');
						expect(packageObject).to.have.property('version');
						unlink('tests/provider/00/package.json', () => rmdir('tests/provider/00', () => done()));
					})
					.catch(() => done('error'));
			})
			.catch(() => done('error'));
		});
	});

	it('process prod and dev', done =>
	{
		option.init(
		{
			path: 'tests/provider/02'
		});
		packager
			.readFileAsync()
			.then(content => helper.parseJson(content.toString()))
			.then((packageObject : Package) =>
			{
				option.set('packageFile', 'package_expect.json');
				packager
					.readFileAsync()
					.then(content => helper.parseJson(content.toString()))
					.then((expectObject : Package) =>
					{
						expect(packager.process(packageObject)).to.deep.equal(expectObject);
						done();
					})
					.catch(() => done('error'));
			})
			.catch(() => done('error'));
	});

	it('process lint and test', done =>
	{
		option.init(
		{
			path: 'tests/provider/03',
			targetArray:
			[
				'lintDependencies',
				'testDependencies'
			]
		});
		packager
			.readFileAsync()
			.then(content => helper.parseJson(content.toString()))
			.then((packageObject : Package) =>
			{
				option.set('packageFile', 'package_expect.json');
				packager
					.readFileAsync()
					.then(content => helper.parseJson(content.toString()))
					.then((expectObject : Package) =>
					{
						expect(packager.process(packageObject)).to.deep.equal(expectObject);
						done();
					})
					.catch(() => done('error'));
			})
			.catch(() => done('error'));
	});

	it('process dev without lint and test', done =>
	{
		option.init(
		{
			path: 'tests/provider/04',
			targetArray:
			[
				'devDependencies'
			],
			filterArray:
			[
				'lintDependencies',
				'testDependencies'
			]
		});
		packager
			.readFileAsync()
			.then(content => helper.parseJson(content.toString()))
			.then((packageObject : Package) =>
			{
				option.set('packageFile', 'package_expect.json');
				packager
					.readFileAsync()
					.then(content => helper.parseJson(content.toString()))
					.then((expectObject : Package) =>
					{
						expect(packager.process(packageObject)).to.deep.equal(expectObject);
						done();
					})
					.catch(() => done('error'));
			})
			.catch(() => done('error'));
	});

	it('process build and lint using reference', done =>
	{
		option.init(
		{
			path: 'tests/provider/05',
			targetArray:
			[
				'buildDependencies',
				'lintDependencies'
			]
		});
		packager
			.readFileAsync()
			.then(content => helper.parseJson(content.toString()))
			.then((packageObject : Package) =>
			{
				option.set('packageFile', 'package_expect.json');
				packager
					.readFileAsync()
					.then(content => helper.parseJson(content.toString()))
					.then((expectObject : Package) =>
					{
						expect(packager.process(packageObject)).to.deep.equal(expectObject);
						done();
					})
					.catch(() => done('error'));
			})
			.catch(() => done('error'));
	});

	[
		'dirty',
		'exact',
		'minor',
		'patch'
	]
	.map((range : Range) =>
	{
		it('process dirty to ' + range, done =>
		{
			option.init(
			{
				path: 'tests/provider/06',
				range,
				targetArray:
				[
					'dirtyDependencies'
				]
			});
			packager
				.readFileAsync()
				.then(content => helper.parseJson(content.toString()))
				.then((packageObject : Package) =>
				{
					option.set('packageFile', 'package_expect_' + range + '.json');
					packager
						.readFileAsync()
						.then(content => helper.parseJson(content.toString()))
						.then((expectObject : Package) =>
						{
							expect(packager.process(packageObject)).to.deep.equal(expectObject);
							done();
						})
						.catch(() => done('error'));
				})
				.catch(() => done('error'));
		});
	});

	it('process workspace', done =>
	{
		option.init(
		{
			path: 'tests/provider/07'
		});
		packager
			.readFileAsync()
			.then(content => helper.parseJson(content.toString()))
			.then((packageObject : Package) =>
			{
				expect(packager.process(packageObject)).to.deep.equal(packageObject);
				done();
			})
			.catch(() => done('error'));
	});
});
