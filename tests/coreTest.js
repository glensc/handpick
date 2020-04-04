const expect = require('chai').expect;
const handpick = require('../');
const core = handpick.core;
const option = handpick.option;
const CORE = new core(
{
	option
});

describe('core', () =>
{
	it('read file', done =>
	{
		option.init(
		{
			package: 'tests/provider/package.json'
		});
		CORE.readFile()
			.then(packageArray =>
			{
				expect(packageArray).to.have.property('name');
				expect(packageArray).to.have.property('version');
				expect(packageArray).to.have.property('dependencies');
				expect(packageArray).to.have.property('devDependencies');
				expect(packageArray).to.have.property('lintDependencies');
				expect(packageArray).to.have.property('buildDependencies');
				done();
			})
			.catch(() => done('error'));
	});

	it('write file', done =>
	{
		option.init(
		{
			package: 'tests/provider/package_write.json'
		});
		CORE.writeFile(
			{
				name: 'test-write'
			})
			.then(() =>
			{
				CORE.readFile()
					.then(packageArray =>
					{
						expect(packageArray).to.have.property('name');
						done();
					})
					.catch(() => done('error'));
			})
			.catch(() => done('error'));
	});

	it('prepare lint and build', done =>
	{
		option.init(
		{
			package: 'tests/provider/package.json',
			targetArray:
			[
				'lintDependencies',
				'buildDependencies'
			]
		});
		CORE.readFile()
			.then(packageArray =>
			{
				option.set('package', 'tests/provider/package_prepare_lint_build.json');
				CORE.readFile()
					.then(equalArray =>
					{
						expect(CORE.prepare(packageArray)).to.deep.equal(equalArray);
						done();
					})
					.catch(() => done('error'));
			})
			.catch(() => done('error'));
	});

	it('restore lint and build', done =>
	{
		option.init(
		{
			package: 'tests/provider/package_prepare_lint_build.json',
			targetArray:
			[
				'lintDependencies',
				'buildDependencies'
			]
		});
		CORE.readFile()
			.then(packageArray =>
			{
				option.set('package', 'tests/provider/package.json');
				CORE.readFile()
					.then(equalArray =>
					{
						expect(CORE.restore(packageArray)).to.deep.equal(equalArray);
						done();
					})
					.catch(() => done('error'));
			})
			.catch(() => done('error'));
	});
});
