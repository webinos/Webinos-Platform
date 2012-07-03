/*******************************************************************************
*  Code contributed to the webinos project
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*     http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*******************************************************************************/


// Required Setup
//var gallery = navigator.service.gallery;
var gallery = {};



// Test 1 -  Find galleries
describe("Find galleries", function() {
	it("all predefined galleries are gotten", function(done){
		gallery.getGalleries(function (galleryInfoObjs){
			expect(galleryInfoObjs).not.toBeNull();
			expect(galleryInfoObjs.length).not.toBeLessThan(0);
			done();
		});
	});
	
	it("all predefined galleries are found", function(done){
		gallery.getGalleries(function (galleryInfoObjs){
			expect(galleryInfoObjs).not.toBeNull();
			expect(galleryInfoObjs.length).not.toBeLessThan(0);
			gallery.find(['title', 'uri'], function(mediaObj){
				expect(mediaObjs).not.toBeNull();
				expect(mediaObjs.length).not.toBeLessThan(0);
				for (var i in mediaObjs) {
					expect(mediaObjs[i].gallery).not.toBeNull();
				}
				done();
			}, /* filter */ {filter: 'filter1', galleries: galleryInfoObjs});
		});
	});
	
	
	it("local (offline) galleries are found", function(done){
		gallery.getGalleries(function (galleryInfoObjs){
			expect(galleryInfoObjs).not.toBeNull();
			expect(galleryInfoObjs.length).not.toBeLessThan(0);
			var galleries = [];
			for (var i in galleryInfoObjs) {
				if (galleryInfoObjs.location == 'local') {
					galleries.push(galleryInfoObjs[i]);
				}
			}
			gallery.find(['title', 'uri'], function(mediaObj){
				expect(mediaObjs).not.toBeNull();
				expect(mediaObjs.length).not.toBeLessThan(0);
				for (var i in mediaObjs) {
					expect(mediaObjs[i].gallery).not.toBeNull();
				}
				done();
			}, /* filter */ {filter: 'filter1', galleries: galleries});
		});
	});
});

// Test 2 -   Test find mechanism with filters
describe("Test find mechanism with filters", function() {
	
	it("correct media is found by using the IMAGE filter", function(done) {
		gallery.getGalleries(function (galleryInfoObjs){
			expect(galleryInfoObjs).not.toBeNull();
			gallery.find(['title', 'language', 'location'], function(mediaObj){
				expect(mediaObjs).not.toBeNull();
				for (var i in mediaObjs) {
					expect(mediaObjs[i].title).toBeDefined();
					expect(mediaObjs[i].language).toBeDefined();
					expect(mediaObjs[i].location).toBeDefined();
				}
				done();
			}, /* filter */ {filter: 'filterImage', mediaType: Gallery.IMAGE_TYPE});
		});
	});
	
	it("correct media is found by using the IMAGE filter", function(done) {
		gallery.getGalleries(function (galleryInfoObjs){
			expect(galleryInfoObjs).not.toBeNull();
			gallery.find(['title', 'frameSize', 'format'], function(mediaObj){
				expect(mediaObjs).not.toBeNull();
				for (var i in mediaObjs) {
					expect(mediaObjs[i].title).toBeDefined();
					expect(mediaObjs[i].frameSize).toBeDefined();
					expect(mediaObjs[i].format).toBeDefined();
				}
				done();
			}, /* filter */ {filter: 'filterImage', mediaType: Gallery.VIDEO_TYPE, firstSortOption: Gallery.SORT_BY_DATE});
		});
	});
	
});


// Test 3 - Test error callback invocation
describe("Test error callback invocation", function() {
	
	it("invalid parameter was provided to launch the error callback", function(done) {
		gallery.getGalleries(function (galleryInfoObjs){
			expect(galleryInfoObjs).not.toBeNull();
			gallery.find(['tittttle'], function (mediaObj){ },  function (error){
				expect(error).not.toBeUndefined();
				expect(error).not.toBeNull();
				expect(error).toEqual(GalleryError.INVALID_ARGUMENT_ERROR);				
				done();
			}, /* filter */ {filter: 'filterImage', mediaType: NaN});
		});
	});
	
	
	it("second search will come to soon to launch the error callback", function(done) {
		gallery.getGalleries(function () {
			gallery.find(['title'], function (){}, function (error) {
				expect(error).not.toBeUndefined();
				expect(error).not.toBeNull();
				expect(error).toEqual(GalleryError.PENDING_OPERATION_ERROR);
			});
			gallery.find(['title'], function (){
			}, function (error) {
				expect(error).not.toBeUndefined();
				expect(error).not.toBeNull();
				expect(error).toEqual(GalleryError.PENDING_OPERATION_ERROR);				 
				done();
			});
		}, function () {});
	});	
	
});