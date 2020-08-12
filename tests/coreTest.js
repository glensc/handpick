const expect = require('chai').expect;
const helper = require('utility-redaxmedia').helper;
const handpick = require('../');
const core = handpick.core;
const option = handpick.option;
const CORE = new core(
{
	option
});

describe('core', () =>
{
	beforeEach(() =>
	{
		const initObject = helper.module.load(__dirname + '/../option.json');

		option.initWithConfig(initObject);
	});

	it('read object from file', done =>
	{
		option.initWithConfig(
		{
			path: 'tests/provider/core'
		});
		CORE.readObjectFromFile()
			.then(packageObject =>
			{
				expect(packageObject).to.have.property('name');
				expect(packageObject).to.have.property('version');
				expect(packageObject).to.have.property('dependencies');
				expect(packageObject).to.have.property('devDependencies');
				expect(packageObject).to.have.property('lintDependencies');
				expect(packageObject).to.have.property('testDependencies');
				expect(packageObject).to.have.property('dirtyDependencies');
				done();
			})
			.catch(() => done('error'));
	});

	it('write object to file', done =>
	{
		option.initWithConfig(
		{
			path: 'tests/provider/core',
			file: 'package_write.json'
		});
		CORE.writeObjectToFile(
			{
				name: 'test-write'
			})
			.then(() =>
			{
				CORE.readObjectFromFile()
					.then(packageObject =>
					{
						expect(packageObject).to.have.property('name');
						done();
					})
					.catch(() => done('error'));
			})
			.catch(() => done('error'));
	});

	it('prepare prod and dev', done =>
	{
		option.initWithConfig(
		{
			path: 'tests/provider/core'
		});
		CORE.readObjectFromFile()
			.then(packageObject =>
			{
				option.set('file', 'package_prepare_prod_and_dev.json');
				CORE.readObjectFromFile()
					.then(expectObject =>
					{
						expect(CORE.prepare(packageObject)).to.deep.equal(expectObject);
						done();
					})
					.catch(() => done('error'));
			})
			.catch(() => done('error'));
	});

	option.get('rangeArray').map(range =>
	{
		it('prepare dirty to ' + range, done =>
		{
			option.initWithConfig(
			{
				path: 'tests/provider/core',
				range,
				targetArray:
				[
					'dirtyDependencies'
				]
			});
			CORE.readObjectFromFile()
				.then(packageObject =>
				{
					option.set('file', 'package_prepare_dirty_to_' + range + '.json');
					CORE.readObjectFromFile()
						.then(expectObject =>
						{
							expect(CORE.prepare(packageObject)).to.deep.equal(expectObject);
							done();
						})
						.catch(() => done('error'));
				})
				.catch(() => done('error'));
		});
	});

	it('prepare lint and test', done =>
	{
		option.initWithConfig(
		{
			path: 'tests/provider/core',
			targetArray:
			[
				'lintDependencies',
				'testDependencies'
			]
		});
		CORE.readObjectFromFile()
			.then(packageObject =>
			{
				option.set('file', 'package_prepare_lint_and_test.json');
				CORE.readObjectFromFile()
					.then(expectObject =>
					{
						expect(CORE.prepare(packageObject)).to.deep.equal(expectObject);
						done();
					})
					.catch(() => done('error'));
			})
			.catch(() => done('error'));
	});

	it('prepare dev without lint', done =>
	{
		option.initWithConfig(
		{
			path: 'tests/provider/core',
			targetArray:
			[
				'devDependencies'
			],
			filterArray:
			[
				'lintDependencies'
			]
		});
		CORE.readObjectFromFile()
			.then(packageObject =>
			{
				option.set('file', 'package_prepare_dev_without_lint.json');
				CORE.readObjectFromFile()
					.then(expectObject =>
					{
						expect(CORE.prepare(packageObject)).to.deep.equal(expectObject);
						done();
					})
					.catch(() => done('error'));
			})
			.catch(() => done('error'));
	});

	it('start wording', () =>
	{
		option.initWithConfig(
		{
			path: 'tests/provider/core'
		});
		expect(CORE.startWording()).to.equal('Hand picking EXACT dependencies and devDependencies via NPM');
		option.set('manager', 'yarn');
		option.set('range', 'patch');
		option.set('targetArray',
		[
			'devDependencies'
		]);
		option.set('filterArray',
		[
			'lintDependencies'
		]);
		expect(CORE.startWording()).to.equal('Hand picking PATCH devDependencies without lintDependencies via YARN');
	});
});
