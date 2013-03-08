package org.webinos.impl.mediacontent;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.webinos.api.DeviceAPIError;
import org.webinos.api.mediacontent.FilterValues;
import org.webinos.api.mediacontent.MediaAudio;
import org.webinos.api.mediacontent.MediaContentErrorCallback;
import org.webinos.api.mediacontent.MediaFolder;
import org.webinos.api.mediacontent.MediaFolderSuccessCallback;
import org.webinos.api.mediacontent.MediaImage;
import org.webinos.api.mediacontent.MediaItem;
import org.webinos.api.mediacontent.MediaItemCollection;
import org.webinos.api.mediacontent.MediaItemSuccessCallback;
import org.webinos.api.mediacontent.MediaSource;
import org.webinos.api.mediacontent.MediaVideo;
import org.webinos.api.mediacontent.SortMode;
import org.webinos.impl.mediacontent.Mapping.CompositeDbField;
import org.webinos.impl.mediacontent.Mapping.DbField;
import org.webinos.impl.mediacontent.Mapping.SingleDbField;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;

public class LocalMediaSource extends MediaSource {

  private Context ctx;

  enum GetFoldersStrategy {
    ALL, STANDARD_FOLDERS
  };

  private GetFoldersStrategy getFoldersStrategy;

  private String volumeName;
  private String storageType;
  
  ContentResolver contentResolver;
  Uri contentUri;

  public LocalMediaSource(Context ctx, String volumeName, GetFoldersStrategy getFoldersStrategy) {
    this.ctx = ctx;
    
    this.volumeName = volumeName;
    this.getFoldersStrategy = getFoldersStrategy;
    
    contentResolver = ctx.getContentResolver();
    
    contentUri = MediaStore.Files.getContentUri(volumeName);

    if (volumeName.equals("internal")) {
      storageType = MediaFolder.STORAGE_TYPE_INTERNAL;
    } else if (volumeName.equals("external")) {
      storageType = MediaFolder.STORAGE_TYPE_EXTERNAL;
    } else {
      throw new DeviceAPIError(DeviceAPIError.INVALID_ERROR);
    }
  }

  private static String commaSeparatedStringFromArray(String[] array) {
    StringBuffer buf = new StringBuffer();
    if (array != null && array.length > 0) {
      buf.append(array[0]);
      for (int i = 1; i < array.length; i++) {
        buf.append(",");
        buf.append(array[i]);
      }
    }
    return buf.toString();
  }

  private class GetFoldersOperation implements Runnable {

    private String storageType;
    private MediaFolderSuccessCallback successCallback;
    private MediaContentErrorCallback errorCallback;

    public GetFoldersOperation(String storageType,
        MediaFolderSuccessCallback successCallback,
        MediaContentErrorCallback errorCallback) {
      this.storageType = storageType;
      this.successCallback = successCallback;
      this.errorCallback = errorCallback;
    }

    @Override
    public void run() {
      try {
        Cursor cursor = null;
        List<String> mediaFolderIds = new ArrayList<String>();
        String[] projection = { "DISTINCT "
            + MediaStore.Files.FileColumns.PARENT };
        String selection = MediaStore.Files.FileColumns.MEDIA_TYPE
            + " IN("
            + commaSeparatedStringFromArray(new String[] {
                String.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_AUDIO),
                String.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_VIDEO),
                String.valueOf(MediaStore.Files.FileColumns.MEDIA_TYPE_IMAGE) })
            + ")";
        String[] selectionArgs = null;
        try {
          cursor = contentResolver.query(contentUri, projection, selection, selectionArgs, null);
          while (cursor.moveToNext()) {
            mediaFolderIds.add(cursor.getString(0));
          }
        } finally {
          if (cursor != null) {
            cursor.close();
          }
        }

        List<MediaFolder> mediaFolders = new ArrayList<MediaFolder>();
        projection = new String[] {
            "DISTINCT " + MediaStore.Files.FileColumns._ID,
            MediaStore.Files.FileColumns.DATA,
            MediaStore.Files.FileColumns.TITLE,
            MediaStore.Files.FileColumns.DATE_MODIFIED };
        selection = MediaStore.Files.FileColumns._ID
            + " IN("
            + commaSeparatedStringFromArray(mediaFolderIds
                .toArray(new String[mediaFolderIds.size()])) + ")";
        selectionArgs = null;
        try {
          cursor = contentResolver.query(contentUri, projection, selection, selectionArgs, null);
          while (cursor.moveToNext()) {
            MediaFolder mediaFolder = new MediaFolder(cursor.getString(0),
                cursor.getString(1), cursor.getString(2), storageType,
                new Date(cursor.getLong(3) * 1000));
            mediaFolders.add(mediaFolder);
          }
        } finally {
          if (cursor != null) {
            cursor.close();
          }
        }

        if (successCallback != null) {
          successCallback.onSuccess(mediaFolders
              .toArray(new MediaFolder[mediaFolders.size()]));
        }
      } catch (Exception e) {
        if (errorCallback != null) {
          errorCallback.onError(e.toString());
        }
      }
    }
  }

  @Override
  public void getFolders(MediaFolderSuccessCallback successCallback,
      MediaContentErrorCallback errorCallback) {

    if (getFoldersStrategy.equals(GetFoldersStrategy.STANDARD_FOLDERS)) {
      List<MediaFolder> folders = new ArrayList<MediaFolder>();
      if (storageType.equals(MediaFolder.STORAGE_TYPE_EXTERNAL)) {
        int i = 0;
        for (String folderName : new String[] { Environment.DIRECTORY_MUSIC,
            Environment.DIRECTORY_PICTURES, Environment.DIRECTORY_MOVIES,
            Environment.DIRECTORY_DOWNLOADS, Environment.DIRECTORY_DCIM }) {
          File folder = Environment
              .getExternalStoragePublicDirectory(folderName);
          if (folder != null && folder.exists() && folder.isDirectory()) {
            folders
                .add(new MediaFolder(String.valueOf(i++), folder.getPath(),
                    folder.getName(), storageType, new Date(folder
                        .lastModified())));
          }
        }
      }
      if (successCallback != null) {
        successCallback.onSuccess(folders.toArray(new MediaFolder[folders
            .size()]));
      }
    } else if (getFoldersStrategy.equals(GetFoldersStrategy.ALL)) {
      GetFoldersOperation op = new GetFoldersOperation(storageType,
          successCallback, errorCallback);
      new Thread(op).start();
    }
  }

  private Object getValue(Cursor cursor, SingleDbField dbField) {
    Object value = null;
    int index = cursor.getColumnIndex(dbField.getName());
    if (index != -1) {
      if (cursor.getType(index) == Cursor.FIELD_TYPE_STRING) {
        value = cursor.getString(index);
      } else if (cursor.getType(index) == Cursor.FIELD_TYPE_INTEGER) {
        value = cursor.getLong(index);
      } else if (cursor.getType(index) == Cursor.FIELD_TYPE_FLOAT) {
        value = cursor.getDouble(index);
      }
    }
    if (dbField.getTranslator() != null) {
      value = dbField.getTranslator().getAttribValue(value);
    }
    return value;
  }

  private class FindItemsOperation implements Runnable {

    private MediaItemSuccessCallback successCallback;
    private MediaContentErrorCallback errorCallback;
    private String folderId;
    private AbstractFilter filter;
    private SortMode sortMode;
    private long count;
    private long offset;

    public FindItemsOperation(MediaItemSuccessCallback successCallback,
        MediaContentErrorCallback errorCallback, String folderId,
        AbstractFilter filter, SortMode sortMode, long count, long offset) {
      this.successCallback = successCallback;
      this.errorCallback = errorCallback;
      this.folderId = folderId;
      this.filter = filter;
      this.sortMode = sortMode;
      this.count = count;
      this.offset = offset;
    }

    @Override
    public void run() {
      try {
        String[] projection = Mapping.getProjection();

        String selection = null;
        String[] selectionArgs = null;

        selection = MediaStore.Files.FileColumns.MEDIA_TYPE + " != "
            + MediaStore.Files.FileColumns.MEDIA_TYPE_NONE;

        if (filter != null) {
          SelectStatement selectStmt = QueryBuilder.getSelect(filter);
          if (selectStmt != null) {
            selection += " AND " + selectStmt.getStatement();
            selectionArgs = selectStmt.getArgs();
          }
        }

        if (folderId != null) {
          selection = selection += " AND "
              + MediaStore.Files.FileColumns.PARENT + " = " + folderId;
        }

        String sortOrder = null;
        if (sortMode != null) {
          DbField dbField = Mapping.getDbField(sortMode.attributeName);
          if (dbField instanceof SingleDbField) {
            sortOrder = ((SingleDbField) dbField).getName() + " "
                + sortMode.sortModeOrder;
          } else {
            throw new DeviceAPIError(DeviceAPIError.INVALID_VALUES_ERR);
          }
        }

        List<MediaItem> mediaItems = new ArrayList<MediaItem>();

        Map<String, Object> valueSet = new HashMap<String, Object>();
        Cursor cursor = contentResolver.query(contentUri, projection, selection, selectionArgs,
            sortOrder);
        while (cursor.moveToNext()) {

          for (String attribute : Mapping.getAttributes()) {
            DbField dbField = Mapping.getDbField(attribute);
            if (dbField instanceof SingleDbField) {
              SingleDbField singleDbField = (SingleDbField) dbField;
              Object attribValue = getValue(cursor, singleDbField);
              if (attribValue != null) {
                valueSet.put(attribute, attribValue);
              }
            } else if (dbField instanceof CompositeDbField) {
              CompositeDbField compositeDbField = (CompositeDbField) dbField;
              Object[] values = new Object[compositeDbField.getDbFields().length];
              int i = 0;
              for (SingleDbField singleDbField : compositeDbField.getDbFields()) {
                values[i++] = getValue(cursor, singleDbField);
              }
              if (compositeDbField.getCompositeHandler() != null) {
                Object attribValue = compositeDbField.getCompositeHandler()
                    .getComposite(values);
                if (attribValue != null) {
                  valueSet.put(attribute, attribValue);
                }
              } else {
                throw new DeviceAPIError(DeviceAPIError.INVALID_ERROR);
              }
            }
          }

          String mediaType = (String) valueSet.get("type");

          if (MediaItem.MEDIATYPE_AUDIO.equals(mediaType)) {
            mediaItems.add(new MediaAudio(valueSet));
          } else if (MediaItem.MEDIATYPE_VIDEO.equals(mediaType)) {
            mediaItems.add(new MediaVideo(valueSet));
          } else if (MediaItem.MEDIATYPE_IMAGE.equals(mediaType)) {
            mediaItems.add(new MediaImage(valueSet));
          } else if (MediaItem.MEDIATYPE_UNKNOWN.equals(mediaType)) {
            // do nothing
          }
        }

        MediaItemCollection mediaItemCollection = new MediaItemCollection();
        mediaItemCollection.size = mediaItems.size();
        mediaItemCollection.audios = new MediaAudio[mediaItemCollection.size];
        mediaItemCollection.images = new MediaImage[mediaItemCollection.size];
        mediaItemCollection.videos = new MediaVideo[mediaItemCollection.size];

        for (int i = 0; i < mediaItems.size(); i++) {
          if (mediaItems.get(i) instanceof MediaAudio) {
            mediaItemCollection.audios[i] = (MediaAudio) mediaItems.get(i);
          } else if (mediaItems.get(i) instanceof MediaImage) {
            mediaItemCollection.images[i] = (MediaImage) mediaItems.get(i);
          } else if (mediaItems.get(i) instanceof MediaVideo) {
            mediaItemCollection.videos[i] = (MediaVideo) mediaItems.get(i);
          }
        }
       
        if (successCallback != null) {
          successCallback.onSuccess(mediaItemCollection);
        }
        
      } catch (Exception e) {
        if (errorCallback != null) {
          errorCallback.onError(e.toString());
        }
      }
    }
  }
  
  @Override
  public void findItems(MediaItemSuccessCallback successCallback,
      MediaContentErrorCallback errorCallback, String folderId,
      FilterValues filterValues, SortMode sortMode, long count, long offset) {
    
    FindItemsOperation op = new FindItemsOperation(successCallback,
        errorCallback, folderId, AbstractFilter.getFilter(filterValues),
        sortMode, count, offset);
    new Thread(op).start();
  }
}
