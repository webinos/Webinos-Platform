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
 * Copyright 2011 Telecom Italia SpA
 * 
 ******************************************************************************/

package org.webinos.impl;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.meshpoint.anode.AndroidContext;
import org.meshpoint.anode.bridge.Env;
import org.meshpoint.anode.module.IModule;
import org.meshpoint.anode.module.IModuleContext;

import org.webinos.api.ErrorCallback;
import org.webinos.api.PendingOperation;
import org.webinos.api.gallery.GalleryErrorCB;
import org.webinos.api.gallery.GalleryFindCB;
import org.webinos.api.gallery.GalleryFindOptions;
import org.webinos.api.gallery.GalleryInfo;
import org.webinos.api.gallery.GalleryInfoCB;
import org.webinos.api.gallery.GalleryManager;
import org.webinos.api.gallery.GalleryError;
import org.webinos.api.gallery.MediaObject;

import android.content.Context;
import android.util.Log;
import android.media.MediaMetadataRetriever;
import android.media.ExifInterface;
import android.webkit.MimeTypeMap;


public class GalleryImpl extends GalleryManager implements IModule {

	private Context androidContext;
	private boolean searchInProgress;

	private static final String LABEL = "org.webinos.impl.GalleryImpl";

	private	static final String[] gallerySearchPaths = {
		"/sdcard"
	};

	private	static final String[] galleryExcludePaths = {
		"/sdcard/widget"
	};

	//TODO automatically retrieve the supported mimetypes...
	private static final String[] supportedMimetypes = {
		"image/png",
		"image/jpeg",
		"image/gif",
		"audio/mpeg",
		"video/3gpp"
	};
	
	/*****************************
	 * GalleryManager methods
	 *****************************/
	@Override
	public PendingOperation find(String[] fields, GalleryFindCB successCB,
			GalleryErrorCB errorCB, GalleryFindOptions options) {
		Log.v(LABEL, "find");

		GalleryFinder galleryFinder = new GalleryFinder(successCB, errorCB);
		Thread t = new Thread(galleryFinder);
		t.start();

		return new GalleryPendingOperation(t, galleryFinder);
	}

	@Override
	public PendingOperation getGalleries(GalleryInfoCB successCB,
			GalleryErrorCB errorCB) {
		// TODO Auto-generated method stub
		return null;
	}

	/*****************************
	 * IModule methods
	 *****************************/
	@Override
	public Object startModule(IModuleContext ctx) {
		androidContext = ((AndroidContext)ctx).getAndroidContext();
		setSearchInProgress(false);
		return this;
	}

	@Override
	public void stopModule() {
	}
	
	private synchronized boolean getSearchInProgress() {
		return searchInProgress;
	}

	private synchronized void setSearchInProgress(boolean val) {
		searchInProgress = val;
	}

	class GalleryFinder implements GalleryRunnable {

		private Env env = Env.getCurrent();
		private GalleryFindCB successCallback;
		private GalleryErrorCB errorCallback;
		private boolean stopped;
		
		private GalleryFinder(GalleryFindCB successCB, GalleryErrorCB errorCB) {
			this.successCallback = successCB;
			this.errorCallback = errorCB;
		}
		
		public synchronized boolean isStopped() {
			return stopped;
		}

		public synchronized void stop() {
			stopped = true;
		}
		
		private boolean searchGallery(int index) {
			return true;
		}
		
		private boolean isMediaFile(File file) {
			String fileName = file.getName();
			if(fileName.lastIndexOf(".")>0) {
				String extension = fileName.substring(fileName.lastIndexOf("."));
				String mimetype = MimeTypeMap.getSingleton().getMimeTypeFromExtension(MimeTypeMap.getFileExtensionFromUrl(extension));
				for (String supportedMimetype: supportedMimetypes){
					if(supportedMimetype == mimetype) {
						Log.v(LABEL, "File "+fileName+", mimetype "+mimetype);
						return true;
					}
				}
			}
			return false;
		}
		
		private MediaObject getMetadata (File file) {
			MediaObject result = new MediaObject();
			result.id = 0; //TODO implement
			result.gallery = null;	//TODO implement
			result.locator = "file://"+file.getAbsolutePath(); //TODO what should this be?

			MediaMetadataRetriever retriever = new MediaMetadataRetriever();

			try {
				retriever.setDataSource(file.getAbsolutePath());
				Log.v(LABEL, "filename is "+result.locator);
				result.title = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_TITLE);
				Log.v(LABEL, "title is "+result.title);

				result.language = null; //TODO not available?
				result.contributor = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUMARTIST);
				result.Creator = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_AUTHOR);
				String dateTmp = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DATE);
				Log.v(LABEL, "date is "+dateTmp);
				result.CreateDate = null; //TODO implement - available DATE and YEAR
				result.location = null; //TODO not available?
				result.description = null; //TODO not available?
				result.keyword = null; //TODO not available?
				result.genre = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_GENRE);
				result.rating = null; //TODO not available?
				result.relation = null; //TODO ???
				result.collection = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_ALBUM);
				result.copyright = null; //TODO not available?
				result.policy = null; //TODO not available?
				result.publisher = null; //TODO not available?
				result.targetAudience = null; //TODO not available?
				result.fragment = null; //TODO not available?
				result.namedFragment = null; //TODO not available?
				result.frameSize = null; //TODO not available?
				result.compression = null; //TODO not available?
				result.duration = Integer.parseInt(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION));
				result.format = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_MIMETYPE); //TODO implement
				result.samplingRate = null; //TODO not available?
				result.framerate = null; //TODO not available?
				result.averageBitRate = null; //TODO not available?
				result.numTracks = Integer.parseInt(retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_NUM_TRACKS));
				
			}
			catch(IllegalArgumentException e) {
				Log.v(LABEL, "Error in processing file metadata (IllegalArgumentException)");
			}
			catch(Exception e) {
				Log.v(LABEL, "Error in processing file metadata "+e.getMessage());
				try {
					ExifInterface exifRetriever = new ExifInterface(file.getAbsolutePath());
	
					result.title = null; //TODO not available?
					result.language = null; //TODO not available?
					result.contributor = null; //TODO not available?
					result.Creator = null; //TODO not available?
					String dateTmp = exifRetriever.getAttribute(ExifInterface.TAG_DATETIME);
					Log.v(LABEL, "date is "+dateTmp);
					result.CreateDate = null;
					result.location = null; //TODO not available?
					result.description = null; //TODO not available?
					result.keyword = null; //TODO not available?
					result.genre = null; //TODO not available?
					result.rating = null; //TODO not available?
					result.relation = null; //TODO not available?
					result.collection = null; //TODO not available?
					result.copyright = null; //TODO not available?
					result.policy = null; //TODO not available?
					result.publisher = null; //TODO not available?
					result.targetAudience = null; //TODO not available?
					result.fragment = null; //TODO not available?
					result.namedFragment = null; //TODO not available?
					result.frameSize = Integer.getInteger(exifRetriever.getAttribute(ExifInterface.TAG_IMAGE_LENGTH)); //TODO no sense: width, heigth, ???
					result.compression = null; //TODO not available?
					result.duration = null; //TODO not available?
					result.format = null; //TODO not available?
					result.samplingRate = null; //TODO not available?
					result.framerate = null; //TODO not available?
					result.averageBitRate = null; //TODO not available?
					result.numTracks = null; //TODO not available?
				}
				catch(Exception e1) {
					Log.v(LABEL, "Error in processing file metadata "+e1.getMessage());
				}

			}

			retriever.release();
			return result;
		}
		
		private List<MediaObject> searchMediaFiles(File dir, List<MediaObject> inList) {
			//Log.v(LABEL, "searchMediaFiles - dir "+dir.getAbsolutePath());
			List<MediaObject> result = inList;
			try {
				File[] dirFiles = dir.listFiles();
				for(String excludeDir: galleryExcludePaths) {
					if(dir.getAbsolutePath().indexOf(excludeDir) != -1) {
						Log.v(LABEL, "EXCLUDE!");
						return result;
					}
				}
				for(int j=0; j<dirFiles.length; j++) {
					//Log.v(LABEL, "searchMediaFiles - found "+dirFiles[j].getAbsolutePath());
					if(!dirFiles[j].isHidden()) {
						if(dirFiles[j].isDirectory()) {
							result = searchMediaFiles(dirFiles[j], result);
						}
						else if(isMediaFile(dirFiles[j])) {
							//Log.v(LABEL, "searchMediaFiles - extracting metadata");
							result.add(getMetadata(dirFiles[j]));
						}
					}
				}
			}
			catch(Exception e) {
				Log.v(LABEL, "searchMediaFiles exception "+e.getMessage());
			}
			
			return result;
		}
		
		public void run() {
			try {
				Log.v(LABEL, "GalleryFinder run");
				Env.setEnv(env);
				boolean busy = false;
				Log.v(LABEL, "GalleryFinder run - 01");
				synchronized(this) {
					busy = getSearchInProgress();
					setSearchInProgress(true);
				}
				Log.v(LABEL, "GalleryFinder run - 02");
				if(busy){
					GalleryError err = new GalleryError();
					err.code = GalleryError.PENDING_OPERATION_ERROR;
					errorCallback.onError(err);
					return;
				}
				Log.v(LABEL, "GalleryFinder run - 03");
				
				//perform search
				List<MediaObject> result = new ArrayList<MediaObject>();
				for(String dirName: gallerySearchPaths) {
					File rootDir = new File(dirName);
					result = searchMediaFiles(rootDir, result);
				}
				Log.v(LABEL, "GalleryFinder run - 06 - "+result.size()+" results found");

				successCallback.onSuccess(result.toArray(new MediaObject[result.size()]));
				Log.v(LABEL, "GalleryFinder run - 08");
				setSearchInProgress(false);
				Log.v(LABEL, "GalleryFinder run - 09");
			}
			catch(Exception e) {
				Log.v(LABEL, "GalleryFinder run - exception "+e.getMessage());
			}
		}		
	}
	
}

abstract interface GalleryRunnable extends Runnable {
	public abstract void stop();
	public abstract boolean isStopped();
}

class GalleryPendingOperation extends PendingOperation {

	private Thread t=null;
	private GalleryRunnable r=null;
	
	public GalleryPendingOperation(Thread t, GalleryRunnable r) {
		this.t = t;
		this.r = r;
	}

	public void cancel() {
		if(t!=null) {
			//TODO is this interrupt needed???
			t.interrupt();
			if(r!=null)
				r.stop();
		}
	}

}



