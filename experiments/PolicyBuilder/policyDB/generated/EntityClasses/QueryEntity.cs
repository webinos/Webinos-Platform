///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.ComponentModel;
using System.Collections.Generic;
using System.Collections;
#if !CF
using System.Runtime.Serialization;
#endif
using System.Data;
using System.Xml.Serialization;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.DaoClasses;
using policyDB.RelationClasses;
using policyDB.HelperClasses;
using policyDB.CollectionClasses;

using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.EntityClasses
{
	
	// __LLBLGENPRO_USER_CODE_REGION_START AdditionalNamespaces
	// __LLBLGENPRO_USER_CODE_REGION_END

	/// <summary>
	/// Entity class which represents the entity 'Query'. <br/><br/>
	/// 
	/// </summary>
	[Serializable]
	public partial class QueryEntity : CommonEntityBase, ISerializable
		// __LLBLGENPRO_USER_CODE_REGION_START AdditionalInterfaces
		// __LLBLGENPRO_USER_CODE_REGION_END	
	{
		#region Class Member Declarations
		private policyDB.CollectionClasses.QueryValueCollection	_queryValue;
		private bool	_alwaysFetchQueryValue, _alreadyFetchedQueryValue;
		private policyDB.CollectionClasses.AttributeCollection _attributeCollectionViaQueryValue;
		private bool	_alwaysFetchAttributeCollectionViaQueryValue, _alreadyFetchedAttributeCollectionViaQueryValue;
		private LibraryEntity _library;
		private bool	_alwaysFetchLibrary, _alreadyFetchedLibrary, _libraryReturnsNewIfNotFound;

		
		// __LLBLGENPRO_USER_CODE_REGION_START PrivateMembers
		// __LLBLGENPRO_USER_CODE_REGION_END
		#endregion

		#region Statics
		private static Dictionary<string, string>	_customProperties;
		private static Dictionary<string, Dictionary<string, string>>	_fieldsCustomProperties;

		/// <summary>All names of fields mapped onto a relation. Usable for in-memory filtering</summary>
		public static class MemberNames
		{
			/// <summary>Member name Library</summary>
			public static readonly string Library = "Library";
			/// <summary>Member name QueryValue</summary>
			public static readonly string QueryValue = "QueryValue";
			/// <summary>Member name AttributeCollectionViaQueryValue</summary>
			public static readonly string AttributeCollectionViaQueryValue = "AttributeCollectionViaQueryValue";

		}
		#endregion
		
		/// <summary>Static CTor for setting up custom property hashtables. Is executed before the first instance of this entity class or derived classes is constructed. </summary>
		static QueryEntity()
		{
			SetupCustomPropertyHashtables();
		}

		/// <summary>CTor</summary>
		public QueryEntity()
		{
			InitClassEmpty(null);
		}


		/// <summary>CTor</summary>
		/// <param name="id">PK value for Query which data should be fetched into this Query object</param>
		public QueryEntity(System.Int32 id)
		{
			InitClassFetch(id, null, null);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for Query which data should be fetched into this Query object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		public QueryEntity(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			InitClassFetch(id, null, prefetchPathToUse);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for Query which data should be fetched into this Query object</param>
		/// <param name="validator">The custom validator object for this QueryEntity</param>
		public QueryEntity(System.Int32 id, IValidator validator)
		{
			InitClassFetch(id, validator, null);
		}


		/// <summary>Private CTor for deserialization</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		protected QueryEntity(SerializationInfo info, StreamingContext context) : base(info, context)
		{
			_queryValue = (policyDB.CollectionClasses.QueryValueCollection)info.GetValue("_queryValue", typeof(policyDB.CollectionClasses.QueryValueCollection));
			_alwaysFetchQueryValue = info.GetBoolean("_alwaysFetchQueryValue");
			_alreadyFetchedQueryValue = info.GetBoolean("_alreadyFetchedQueryValue");
			_attributeCollectionViaQueryValue = (policyDB.CollectionClasses.AttributeCollection)info.GetValue("_attributeCollectionViaQueryValue", typeof(policyDB.CollectionClasses.AttributeCollection));
			_alwaysFetchAttributeCollectionViaQueryValue = info.GetBoolean("_alwaysFetchAttributeCollectionViaQueryValue");
			_alreadyFetchedAttributeCollectionViaQueryValue = info.GetBoolean("_alreadyFetchedAttributeCollectionViaQueryValue");
			_library = (LibraryEntity)info.GetValue("_library", typeof(LibraryEntity));
			if(_library!=null)
			{
				_library.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_libraryReturnsNewIfNotFound = info.GetBoolean("_libraryReturnsNewIfNotFound");
			_alwaysFetchLibrary = info.GetBoolean("_alwaysFetchLibrary");
			_alreadyFetchedLibrary = info.GetBoolean("_alreadyFetchedLibrary");

			base.FixupDeserialization(FieldInfoProviderSingleton.GetInstance(), PersistenceInfoProviderSingleton.GetInstance());
			
			// __LLBLGENPRO_USER_CODE_REGION_START DeserializationConstructor
			// __LLBLGENPRO_USER_CODE_REGION_END
		}

		
		/// <summary>Performs the desync setup when an FK field has been changed. The entity referenced based on the FK field will be dereferenced and sync info will be removed.</summary>
		/// <param name="fieldIndex">The fieldindex.</param>
		protected override void PerformDesyncSetupFKFieldChange(int fieldIndex)
		{
			switch((QueryFieldIndex)fieldIndex)
			{
				case QueryFieldIndex.LibraryId:
					DesetupSyncLibrary(true, false);
					_alreadyFetchedLibrary = false;
					break;
				default:
					base.PerformDesyncSetupFKFieldChange(fieldIndex);
					break;
			}
		}
		
		/// <summary>Gets the inheritance info provider instance of the project this entity instance is located in. </summary>
		/// <returns>ready to use inheritance info provider instance.</returns>
		protected override IInheritanceInfoProvider GetInheritanceInfoProvider()
		{
			return InheritanceInfoProviderSingleton.GetInstance();
		}
		
		/// <summary> Will perform post-ReadXml actions</summary>
		protected override void PostReadXmlFixups()
		{
			_alreadyFetchedQueryValue = (_queryValue.Count > 0);
			_alreadyFetchedAttributeCollectionViaQueryValue = (_attributeCollectionViaQueryValue.Count > 0);
			_alreadyFetchedLibrary = (_library != null);

		}
				
		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public override RelationCollection GetRelationsForFieldOfType(string fieldName)
		{
			return QueryEntity.GetRelationsForField(fieldName);
		}

		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public static RelationCollection GetRelationsForField(string fieldName)
		{
			RelationCollection toReturn = new RelationCollection();
			switch(fieldName)
			{
				case "Library":
					toReturn.Add(QueryEntity.Relations.LibraryEntityUsingLibraryId);
					break;
				case "QueryValue":
					toReturn.Add(QueryEntity.Relations.QueryValueEntityUsingQueryId);
					break;
				case "AttributeCollectionViaQueryValue":
					toReturn.Add(QueryEntity.Relations.QueryValueEntityUsingQueryId, "QueryEntity__", "QueryValue_", JoinHint.None);
					toReturn.Add(QueryValueEntity.Relations.AttributeEntityUsingAttributeId, "QueryValue_", string.Empty, JoinHint.None);
					break;

				default:

					break;				
			}
			return toReturn;
		}



		/// <summary> ISerializable member. Does custom serialization so event handlers do not get serialized.
		/// Serializes members of this entity class and uses the base class' implementation to serialize the rest.</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		[EditorBrowsable(EditorBrowsableState.Never)]
		public override void GetObjectData(SerializationInfo info, StreamingContext context)
		{
			info.AddValue("_queryValue", (!this.MarkedForDeletion?_queryValue:null));
			info.AddValue("_alwaysFetchQueryValue", _alwaysFetchQueryValue);
			info.AddValue("_alreadyFetchedQueryValue", _alreadyFetchedQueryValue);
			info.AddValue("_attributeCollectionViaQueryValue", (!this.MarkedForDeletion?_attributeCollectionViaQueryValue:null));
			info.AddValue("_alwaysFetchAttributeCollectionViaQueryValue", _alwaysFetchAttributeCollectionViaQueryValue);
			info.AddValue("_alreadyFetchedAttributeCollectionViaQueryValue", _alreadyFetchedAttributeCollectionViaQueryValue);
			info.AddValue("_library", (!this.MarkedForDeletion?_library:null));
			info.AddValue("_libraryReturnsNewIfNotFound", _libraryReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchLibrary", _alwaysFetchLibrary);
			info.AddValue("_alreadyFetchedLibrary", _alreadyFetchedLibrary);

			
			// __LLBLGENPRO_USER_CODE_REGION_START GetObjectInfo
			// __LLBLGENPRO_USER_CODE_REGION_END
			base.GetObjectData(info, context);
		}
		
		/// <summary> Sets the related entity property to the entity specified. If the property is a collection, it will add the entity specified to that collection.</summary>
		/// <param name="propertyName">Name of the property.</param>
		/// <param name="entity">Entity to set as an related entity</param>
		/// <remarks>Used by prefetch path logic.</remarks>
		[EditorBrowsable(EditorBrowsableState.Never)]
		public override void SetRelatedEntityProperty(string propertyName, IEntity entity)
		{
			switch(propertyName)
			{
				case "Library":
					_alreadyFetchedLibrary = true;
					this.Library = (LibraryEntity)entity;
					break;
				case "QueryValue":
					_alreadyFetchedQueryValue = true;
					if(entity!=null)
					{
						this.QueryValue.Add((QueryValueEntity)entity);
					}
					break;
				case "AttributeCollectionViaQueryValue":
					_alreadyFetchedAttributeCollectionViaQueryValue = true;
					if(entity!=null)
					{
						this.AttributeCollectionViaQueryValue.Add((AttributeEntity)entity);
					}
					break;

				default:

					break;
			}
		}

		/// <summary> Sets the internal parameter related to the fieldname passed to the instance relatedEntity. </summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		/// <param name="fieldName">Name of field mapped onto the relation which resolves in the instance relatedEntity</param>
		[EditorBrowsable(EditorBrowsableState.Never)]
		public override void SetRelatedEntity(IEntity relatedEntity, string fieldName)
		{
			switch(fieldName)
			{
				case "Library":
					SetupSyncLibrary(relatedEntity);
					break;
				case "QueryValue":
					_queryValue.Add((QueryValueEntity)relatedEntity);
					break;

				default:

					break;
			}
		}
		
		/// <summary> Unsets the internal parameter related to the fieldname passed to the instance relatedEntity. Reverses the actions taken by SetRelatedEntity() </summary>
		/// <param name="relatedEntity">Instance to unset as the related entity of type entityType</param>
		/// <param name="fieldName">Name of field mapped onto the relation which resolves in the instance relatedEntity</param>
		/// <param name="signalRelatedEntityManyToOne">if set to true it will notify the manytoone side, if applicable.</param>
		[EditorBrowsable(EditorBrowsableState.Never)]
		public override void UnsetRelatedEntity(IEntity relatedEntity, string fieldName, bool signalRelatedEntityManyToOne)
		{
			switch(fieldName)
			{
				case "Library":
					DesetupSyncLibrary(false, true);
					break;
				case "QueryValue":
					base.PerformRelatedEntityRemoval(_queryValue, relatedEntity, signalRelatedEntityManyToOne);
					break;

				default:

					break;
			}
		}

		/// <summary> Gets a collection of related entities referenced by this entity which depend on this entity (this entity is the PK side of their FK fields). These
		/// entities will have to be persisted after this entity during a recursive save.</summary>
		/// <returns>Collection with 0 or more IEntity objects, referenced by this entity</returns>
		public override List<IEntity> GetDependingRelatedEntities()
		{
			List<IEntity> toReturn = new List<IEntity>();


			return toReturn;
		}
		
		/// <summary> Gets a collection of related entities referenced by this entity which this entity depends on (this entity is the FK side of their PK fields). These
		/// entities will have to be persisted before this entity during a recursive save.</summary>
		/// <returns>Collection with 0 or more IEntity objects, referenced by this entity</returns>
		public override List<IEntity> GetDependentRelatedEntities()
		{
			List<IEntity> toReturn = new List<IEntity>();
			if(_library!=null)
			{
				toReturn.Add(_library);
			}


			return toReturn;
		}
		
		/// <summary> Gets a List of all entity collections stored as member variables in this entity. The contents of the ArrayList is
		/// used by the DataAccessAdapter to perform recursive saves. Only 1:n related collections are returned.</summary>
		/// <returns>Collection with 0 or more IEntityCollection objects, referenced by this entity</returns>
		public override List<IEntityCollection> GetMemberEntityCollections()
		{
			List<IEntityCollection> toReturn = new List<IEntityCollection>();
			toReturn.Add(_queryValue);

			return toReturn;
		}

		

		

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Query which data should be fetched into this Query object</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id)
		{
			return FetchUsingPK(id, null, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Query which data should be fetched into this Query object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			return FetchUsingPK(id, prefetchPathToUse, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Query which data should be fetched into this Query object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse)
		{
			return Fetch(id, prefetchPathToUse, contextToUse, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Query which data should be fetched into this Query object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <param name="excludedIncludedFields">The list of IEntityField objects which have to be excluded or included for the fetch. 
		/// If null or empty, all fields are fetched (default). If an instance of ExcludeIncludeFieldsList is passed in and its ExcludeContainedFields property
		/// is set to false, the fields contained in excludedIncludedFields are kept in the query, the rest of the fields in the query are excluded.</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse, ExcludeIncludeFieldsList excludedIncludedFields)
		{
			return Fetch(id, prefetchPathToUse, contextToUse, excludedIncludedFields);
		}

		/// <summary> Refetches the Entity from the persistent storage. Refetch is used to re-load an Entity which is marked "Out-of-sync", due to a save action. 
		/// Refetching an empty Entity has no effect. </summary>
		/// <returns>true if Refetch succeeded, false otherwise</returns>
		public override bool Refetch()
		{
			return Fetch(this.Id, null, null, null);
		}

		/// <summary> Returns true if the original value for the field with the fieldIndex passed in, read from the persistent storage was NULL, false otherwise.
		/// Should not be used for testing if the current value is NULL, use <see cref="TestCurrentFieldValueForNull"/> for that.</summary>
		/// <param name="fieldIndex">Index of the field to test if that field was NULL in the persistent storage</param>
		/// <returns>true if the field with the passed in index was NULL in the persistent storage, false otherwise</returns>
		public bool TestOriginalFieldValueForNull(QueryFieldIndex fieldIndex)
		{
			return base.Fields[(int)fieldIndex].IsNull;
		}
		
		/// <summary>Returns true if the current value for the field with the fieldIndex passed in represents null/not defined, false otherwise.
		/// Should not be used for testing if the original value (read from the db) is NULL</summary>
		/// <param name="fieldIndex">Index of the field to test if its currentvalue is null/undefined</param>
		/// <returns>true if the field's value isn't defined yet, false otherwise</returns>
		public bool TestCurrentFieldValueForNull(QueryFieldIndex fieldIndex)
		{
			return base.CheckIfCurrentFieldValueIsNull((int)fieldIndex);
		}

				
		/// <summary>Gets a list of all the EntityRelation objects the type of this instance has.</summary>
		/// <returns>A list of all the EntityRelation objects the type of this instance has. Hierarchy relations are excluded.</returns>
		public override List<IEntityRelation> GetAllRelations()
		{
			return new QueryRelations().GetAllRelations();
		}


		/// <summary> Retrieves all related entities of type 'QueryValueEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'QueryValueEntity'</returns>
		public policyDB.CollectionClasses.QueryValueCollection GetMultiQueryValue(bool forceFetch)
		{
			return GetMultiQueryValue(forceFetch, _queryValue.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'QueryValueEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'QueryValueEntity'</returns>
		public policyDB.CollectionClasses.QueryValueCollection GetMultiQueryValue(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiQueryValue(forceFetch, _queryValue.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'QueryValueEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.QueryValueCollection GetMultiQueryValue(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiQueryValue(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'QueryValueEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.QueryValueCollection GetMultiQueryValue(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedQueryValue || forceFetch || _alwaysFetchQueryValue) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_queryValue.ParticipatesInTransaction)
					{
						base.Transaction.Add(_queryValue);
					}
				}
				_queryValue.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_queryValue.EntityFactoryToUse = entityFactoryToUse;
				}
				_queryValue.GetMultiManyToOne(null, this, filter);
				_queryValue.SuppressClearInGetMulti=false;
				_alreadyFetchedQueryValue = true;
			}
			return _queryValue;
		}

		/// <summary> Sets the collection parameters for the collection for 'QueryValue'. These settings will be taken into account
		/// when the property QueryValue is requested or GetMultiQueryValue is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersQueryValue(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_queryValue.SortClauses=sortClauses;
			_queryValue.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'AttributeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'AttributeEntity'</returns>
		public policyDB.CollectionClasses.AttributeCollection GetMultiAttributeCollectionViaQueryValue(bool forceFetch)
		{
			return GetMultiAttributeCollectionViaQueryValue(forceFetch, _attributeCollectionViaQueryValue.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'AttributeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.AttributeCollection GetMultiAttributeCollectionViaQueryValue(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedAttributeCollectionViaQueryValue || forceFetch || _alwaysFetchAttributeCollectionViaQueryValue) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_attributeCollectionViaQueryValue.ParticipatesInTransaction)
					{
						base.Transaction.Add(_attributeCollectionViaQueryValue);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(QueryFields.Id, ComparisonOperator.Equal, this.Id, "QueryEntity__"));
				_attributeCollectionViaQueryValue.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_attributeCollectionViaQueryValue.EntityFactoryToUse = entityFactoryToUse;
				}
				_attributeCollectionViaQueryValue.GetMulti(filter, GetRelationsForField("AttributeCollectionViaQueryValue"));
				_attributeCollectionViaQueryValue.SuppressClearInGetMulti=false;
				_alreadyFetchedAttributeCollectionViaQueryValue = true;
			}
			return _attributeCollectionViaQueryValue;
		}

		/// <summary> Sets the collection parameters for the collection for 'AttributeCollectionViaQueryValue'. These settings will be taken into account
		/// when the property AttributeCollectionViaQueryValue is requested or GetMultiAttributeCollectionViaQueryValue is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersAttributeCollectionViaQueryValue(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_attributeCollectionViaQueryValue.SortClauses=sortClauses;
			_attributeCollectionViaQueryValue.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves the related entity of type 'LibraryEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'LibraryEntity' which is related to this entity.</returns>
		public LibraryEntity GetSingleLibrary()
		{
			return GetSingleLibrary(false);
		}

		/// <summary> Retrieves the related entity of type 'LibraryEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'LibraryEntity' which is related to this entity.</returns>
		public virtual LibraryEntity GetSingleLibrary(bool forceFetch)
		{
			if( ( !_alreadyFetchedLibrary || forceFetch || _alwaysFetchLibrary) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(QueryEntity.Relations.LibraryEntityUsingLibraryId);

				LibraryEntity newEntity = new LibraryEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.LibraryId);
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (LibraryEntity)base.ActiveContext.Get(newEntity);
					}
					this.Library = newEntity;
				}
				else
				{
					if(_libraryReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_library == null)))
						{
							this.Library = newEntity;
						}
					}
					else
					{
						this.Library = null;
					}
				}
				_alreadyFetchedLibrary = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _library;
		}


		/// <summary> Performs the insert action of a new Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool InsertEntity()
		{
			QueryDAO dao = (QueryDAO)CreateDAOInstance();
			return dao.AddNew(base.Fields, base.Transaction);
		}
		
		/// <summary> Adds the internals to the active context. </summary>
		protected override void AddInternalsToContext()
		{
			_queryValue.ActiveContext = base.ActiveContext;
			_attributeCollectionViaQueryValue.ActiveContext = base.ActiveContext;
			if(_library!=null)
			{
				_library.ActiveContext = base.ActiveContext;
			}


		}


		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity()
		{
			QueryDAO dao = (QueryDAO)CreateDAOInstance();
			return dao.UpdateExisting(base.Fields, base.Transaction);
		}
		
		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <param name="updateRestriction">Predicate expression, meant for concurrency checks in an Update query</param>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity(IPredicate updateRestriction)
		{
			QueryDAO dao = (QueryDAO)CreateDAOInstance();
			return dao.UpdateExisting(base.Fields, base.Transaction, updateRestriction);
		}
	
		/// <summary> Initializes the class with empty data, as if it is a new Entity.</summary>
		/// <param name="validatorToUse">Validator to use.</param>
		protected virtual void InitClassEmpty(IValidator validatorToUse)
		{
			OnInitializing();
			base.Fields = CreateFields();
			base.IsNew=true;
			base.Validator = validatorToUse;

			InitClassMembers();
			
			// __LLBLGENPRO_USER_CODE_REGION_START InitClassEmpty
			// __LLBLGENPRO_USER_CODE_REGION_END

			OnInitialized();
		}
		
		/// <summary>Creates entity fields object for this entity. Used in constructor to setup this entity in a polymorphic scenario.</summary>
		protected virtual IEntityFields CreateFields()
		{
			return EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.QueryEntity);
		}
		
		/// <summary>Creates a new transaction object</summary>
		/// <param name="levelOfIsolation">The level of isolation.</param>
		/// <param name="name">The name.</param>
		protected override ITransaction CreateTransaction( IsolationLevel levelOfIsolation, string name )
		{
			return new Transaction(levelOfIsolation, name);
		}

		/// <summary>
		/// Creates the ITypeDefaultValue instance used to provide default values for value types which aren't of type nullable(of T)
		/// </summary>
		/// <returns></returns>
		protected override ITypeDefaultValue CreateTypeDefaultValueProvider()
		{
			return new TypeDefaultValue();
		}

		/// <summary>
		/// Gets all related data objects, stored by name. The name is the field name mapped onto the relation for that particular data element. 
		/// </summary>
		/// <returns>Dictionary with per name the related referenced data element, which can be an entity collection or an entity or null</returns>
		public override Dictionary<string, object> GetRelatedData()
		{
			Dictionary<string, object> toReturn = new Dictionary<string, object>();
			toReturn.Add("Library", _library);
			toReturn.Add("QueryValue", _queryValue);
			toReturn.Add("AttributeCollectionViaQueryValue", _attributeCollectionViaQueryValue);

			return toReturn;
		}
		

		/// <summary> Initializes the the entity and fetches the data related to the entity in this entity.</summary>
		/// <param name="id">PK value for Query which data should be fetched into this Query object</param>
		/// <param name="validator">The validator object for this QueryEntity</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		protected virtual void InitClassFetch(System.Int32 id, IValidator validator, IPrefetchPath prefetchPathToUse)
		{
			OnInitializing();
			base.Validator = validator;
			InitClassMembers();
			base.Fields = CreateFields();
			bool wasSuccesful = Fetch(id, prefetchPathToUse, null, null);
			base.IsNew = !wasSuccesful;

			
			// __LLBLGENPRO_USER_CODE_REGION_START InitClassFetch
			// __LLBLGENPRO_USER_CODE_REGION_END

			OnInitialized();
		}

		/// <summary> Initializes the class members</summary>
		private void InitClassMembers()
		{
			_queryValue = new policyDB.CollectionClasses.QueryValueCollection(new QueryValueEntityFactory());
			_queryValue.SetContainingEntityInfo(this, "Query");
			_alwaysFetchQueryValue = false;
			_alreadyFetchedQueryValue = false;
			_attributeCollectionViaQueryValue = new policyDB.CollectionClasses.AttributeCollection(new AttributeEntityFactory());
			_alwaysFetchAttributeCollectionViaQueryValue = false;
			_alreadyFetchedAttributeCollectionViaQueryValue = false;
			_library = null;
			_libraryReturnsNewIfNotFound = true;
			_alwaysFetchLibrary = false;
			_alreadyFetchedLibrary = false;


			PerformDependencyInjection();
			
			// __LLBLGENPRO_USER_CODE_REGION_START InitClassMembers
			// __LLBLGENPRO_USER_CODE_REGION_END
			OnInitClassMembersComplete();
		}

		#region Custom Property Hashtable Setup
		/// <summary> Initializes the hashtables for the entity type and entity field custom properties. </summary>
		private static void SetupCustomPropertyHashtables()
		{
			_customProperties = new Dictionary<string, string>();
			_fieldsCustomProperties = new Dictionary<string, Dictionary<string, string>>();

			Dictionary<string, string> fieldHashtable = null;
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Id", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("LibraryId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Description", fieldHashtable);
		}
		#endregion


		/// <summary> Removes the sync logic for member _library</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncLibrary(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _library, new PropertyChangedEventHandler( OnLibraryPropertyChanged ), "Library", QueryEntity.Relations.LibraryEntityUsingLibraryId, true, signalRelatedEntity, "Query", resetFKFields, new int[] { (int)QueryFieldIndex.LibraryId } );		
			_library = null;
		}
		
		/// <summary> setups the sync logic for member _library</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncLibrary(IEntity relatedEntity)
		{
			if(_library!=relatedEntity)
			{		
				DesetupSyncLibrary(true, true);
				_library = (LibraryEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _library, new PropertyChangedEventHandler( OnLibraryPropertyChanged ), "Library", QueryEntity.Relations.LibraryEntityUsingLibraryId, true, ref _alreadyFetchedLibrary, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnLibraryPropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}


		/// <summary> Fetches the entity from the persistent storage. Fetch simply reads the entity into an EntityFields object. </summary>
		/// <param name="id">PK value for Query which data should be fetched into this Query object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <param name="excludedIncludedFields">The list of IEntityField objects which have to be excluded or included for the fetch. 
		/// If null or empty, all fields are fetched (default). If an instance of ExcludeIncludeFieldsList is passed in and its ExcludeContainedFields property
		/// is set to false, the fields contained in excludedIncludedFields are kept in the query, the rest of the fields in the query are excluded.</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		private bool Fetch(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse, ExcludeIncludeFieldsList excludedIncludedFields)
		{
			try
			{
				OnFetch();
				IDao dao = this.CreateDAOInstance();
				base.Fields[(int)QueryFieldIndex.Id].ForcedCurrentValueWrite(id);
				dao.FetchExisting(this, base.Transaction, prefetchPathToUse, contextToUse, excludedIncludedFields);
				return (base.Fields.State == EntityState.Fetched);
			}
			finally
			{
				OnFetchComplete();
			}
		}


		/// <summary> Creates the DAO instance for this type</summary>
		/// <returns></returns>
		protected override IDao CreateDAOInstance()
		{
			return DAOFactory.CreateQueryDAO();
		}
		
		/// <summary> Creates the entity factory for this type.</summary>
		/// <returns></returns>
		protected override IEntityFactory CreateEntityFactory()
		{
			return new QueryEntityFactory();
		}

		#region Class Property Declarations
		/// <summary> The relations object holding all relations of this entity with other entity classes.</summary>
		public  static QueryRelations Relations
		{
			get	{ return new QueryRelations(); }
		}
		
		/// <summary> The custom properties for this entity type.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		public  static Dictionary<string, string> CustomProperties
		{
			get { return _customProperties;}
		}


		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'QueryValue' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathQueryValue
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.QueryValueCollection(),
					(IEntityRelation)GetRelationsForField("QueryValue")[0], (int)policyDB.EntityType.QueryEntity, (int)policyDB.EntityType.QueryValueEntity, 0, null, null, null, "QueryValue", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Attribute' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathAttributeCollectionViaQueryValue
		{
			get
			{
				IEntityRelation intermediateRelation = QueryEntity.Relations.QueryValueEntityUsingQueryId;
				intermediateRelation.SetAliases(string.Empty, "QueryValue_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.AttributeCollection(), intermediateRelation,
					(int)policyDB.EntityType.QueryEntity, (int)policyDB.EntityType.AttributeEntity, 0, null, null, GetRelationsForField("AttributeCollectionViaQueryValue"), "AttributeCollectionViaQueryValue", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Library' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathLibrary
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.LibraryCollection(),
					(IEntityRelation)GetRelationsForField("Library")[0], (int)policyDB.EntityType.QueryEntity, (int)policyDB.EntityType.LibraryEntity, 0, null, null, null, "Library", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}


		/// <summary>Returns the full name for this entity, which is important for the DAO to find back persistence info for this entity.</summary>
		[Browsable(false), XmlIgnore]
		public override string LLBLGenProEntityName
		{
			get { return "QueryEntity";}
		}

		/// <summary> The custom properties for the type of this entity instance.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		[Browsable(false), XmlIgnore]
		public override Dictionary<string, string> CustomPropertiesOfType
		{
			get { return QueryEntity.CustomProperties;}
		}

		/// <summary> The custom properties for the fields of this entity type. The returned Hashtable contains per fieldname a hashtable of name-value pairs. </summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		public  static Dictionary<string, Dictionary<string, string>> FieldsCustomProperties
		{
			get { return _fieldsCustomProperties;}
		}

		/// <summary> The custom properties for the fields of the type of this entity instance. The returned Hashtable contains per fieldname a hashtable of name-value pairs. </summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		[Browsable(false), XmlIgnore]
		public override Dictionary<string, Dictionary<string, string>> FieldsCustomPropertiesOfType
		{
			get { return QueryEntity.FieldsCustomProperties;}
		}

		/// <summary> The Id property of the Entity Query<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "query"."id"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, true, true</remarks>
		public virtual System.Int32 Id
		{
			get { return (System.Int32)GetValue((int)QueryFieldIndex.Id, true); }
			set	{ SetValue((int)QueryFieldIndex.Id, value, true); }
		}
		/// <summary> The LibraryId property of the Entity Query<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "query"."libraryId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 LibraryId
		{
			get { return (System.Int32)GetValue((int)QueryFieldIndex.LibraryId, true); }
			set	{ SetValue((int)QueryFieldIndex.LibraryId, value, true); }
		}
		/// <summary> The Description property of the Entity Query<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "query"."description"<br/>
		/// Table field type characteristics (type, precision, scale, length): NVarChar, 0, 0, 250<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.String Description
		{
			get { return (System.String)GetValue((int)QueryFieldIndex.Description, true); }
			set	{ SetValue((int)QueryFieldIndex.Description, value, true); }
		}

		/// <summary> Retrieves all related entities of type 'QueryValueEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiQueryValue()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.QueryValueCollection QueryValue
		{
			get	{ return GetMultiQueryValue(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for QueryValue. When set to true, QueryValue is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time QueryValue is accessed. You can always execute
		/// a forced fetch by calling GetMultiQueryValue(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchQueryValue
		{
			get	{ return _alwaysFetchQueryValue; }
			set	{ _alwaysFetchQueryValue = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property QueryValue already has been fetched. Setting this property to false when QueryValue has been fetched
		/// will clear the QueryValue collection well. Setting this property to true while QueryValue hasn't been fetched disables lazy loading for QueryValue</summary>
		[Browsable(false)]
		public bool AlreadyFetchedQueryValue
		{
			get { return _alreadyFetchedQueryValue;}
			set 
			{
				if(_alreadyFetchedQueryValue && !value && (_queryValue != null))
				{
					_queryValue.Clear();
				}
				_alreadyFetchedQueryValue = value;
			}
		}

		/// <summary> Retrieves all related entities of type 'AttributeEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiAttributeCollectionViaQueryValue()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.AttributeCollection AttributeCollectionViaQueryValue
		{
			get { return GetMultiAttributeCollectionViaQueryValue(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for AttributeCollectionViaQueryValue. When set to true, AttributeCollectionViaQueryValue is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time AttributeCollectionViaQueryValue is accessed. You can always execute
		/// a forced fetch by calling GetMultiAttributeCollectionViaQueryValue(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchAttributeCollectionViaQueryValue
		{
			get	{ return _alwaysFetchAttributeCollectionViaQueryValue; }
			set	{ _alwaysFetchAttributeCollectionViaQueryValue = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property AttributeCollectionViaQueryValue already has been fetched. Setting this property to false when AttributeCollectionViaQueryValue has been fetched
		/// will clear the AttributeCollectionViaQueryValue collection well. Setting this property to true while AttributeCollectionViaQueryValue hasn't been fetched disables lazy loading for AttributeCollectionViaQueryValue</summary>
		[Browsable(false)]
		public bool AlreadyFetchedAttributeCollectionViaQueryValue
		{
			get { return _alreadyFetchedAttributeCollectionViaQueryValue;}
			set 
			{
				if(_alreadyFetchedAttributeCollectionViaQueryValue && !value && (_attributeCollectionViaQueryValue != null))
				{
					_attributeCollectionViaQueryValue.Clear();
				}
				_alreadyFetchedAttributeCollectionViaQueryValue = value;
			}
		}

		/// <summary> Gets / sets related entity of type 'LibraryEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleLibrary()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual LibraryEntity Library
		{
			get	{ return GetSingleLibrary(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncLibrary(value);
				}
				else
				{
					if(value==null)
					{
						if(_library != null)
						{
							_library.UnsetRelatedEntity(this, "Query");
						}
					}
					else
					{
						if(_library!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "Query");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for Library. When set to true, Library is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Library is accessed. You can always execute
		/// a forced fetch by calling GetSingleLibrary(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchLibrary
		{
			get	{ return _alwaysFetchLibrary; }
			set	{ _alwaysFetchLibrary = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property Library already has been fetched. Setting this property to false when Library has been fetched
		/// will set Library to null as well. Setting this property to true while Library hasn't been fetched disables lazy loading for Library</summary>
		[Browsable(false)]
		public bool AlreadyFetchedLibrary
		{
			get { return _alreadyFetchedLibrary;}
			set 
			{
				if(_alreadyFetchedLibrary && !value)
				{
					this.Library = null;
				}
				_alreadyFetchedLibrary = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property Library is not found
		/// in the database. When set to true, Library will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool LibraryReturnsNewIfNotFound
		{
			get	{ return _libraryReturnsNewIfNotFound; }
			set { _libraryReturnsNewIfNotFound = value; }	
		}



		/// <summary> Gets or sets a value indicating whether this entity is a subtype</summary>
		protected override bool LLBLGenProIsSubType
		{
			get { return false;}
		}

		/// <summary> Gets the type of the hierarchy this entity is in. </summary>
		[System.ComponentModel.Browsable(false), XmlIgnore]
		protected override InheritanceHierarchyType LLBLGenProIsInHierarchyOfType
		{
			get { return InheritanceHierarchyType.None;}
		}
		
		/// <summary>Returns the policyDB.EntityType enum value for this entity.</summary>
		[Browsable(false), XmlIgnore]
		public override int LLBLGenProEntityTypeValue 
		{ 
			get { return (int)policyDB.EntityType.QueryEntity; }
		}
		#endregion


		#region Custom Entity code
		
		// __LLBLGENPRO_USER_CODE_REGION_START CustomEntityCode
		// __LLBLGENPRO_USER_CODE_REGION_END
		#endregion

		#region Included code

		#endregion
	}
}
