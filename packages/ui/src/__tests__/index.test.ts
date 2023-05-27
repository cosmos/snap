/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";

describe('sum test', () => {
	it('adds 1 + 2 to equal 3', () => {
		expect(1 + 2).toBe(3);
	});
});
