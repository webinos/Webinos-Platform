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
* Copyright 2011-2012 Paddy Byers
*
******************************************************************************/

package org.webinos.api.gallery;

import java.util.Date;

import org.meshpoint.anode.idl.Dictionary;
import org.webinos.api.File;

public class MediaObject extends File implements Dictionary {
	public int id;
	public GalleryInfo gallery;
	public String title;
	public String language;
	public String locator;
	public String contributor;
	public String Creator;
	public Date CreateDate;
	public String location;
	public String description;
	public String keyword;
	public String genre;
	public Integer rating;
	public String relation;
	public String collection;
	public String copyright;
	public String policy;
	public String publisher;
	public String targetAudience;
	public String fragment;
	public String namedFragment;
	public Integer frameSize;
	public String compression;
	public Integer duration;
	public String format;
	public Integer samplingRate;
	public Integer framerate;
	public Integer averageBitRate;
	public Integer numTracks;
}
