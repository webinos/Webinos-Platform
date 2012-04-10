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
	/// Entity class which represents the entity 'QueryValue'. <br/><br/>
	/// 
	/// </summary>
	[Serializable]
	public partial class QueryValueEntity : CommonEntityBase, ISerializable
		// __LLBLGENPRO_USER_CODE_REGION_START AdditionalInterfaces
		// __LLBLGENPRO_USER_CODE_REGION_END	
	{
		#region Class Member Declarations


		private AttributeEntity _attribute;
		private bool	_alwaysFetchAttribute, _alreadyFetchedAttribute, _attributeReturnsNewIfNotFound;
		private QueryEntity _query;
		private bool	_alwaysFetchQuery, _alreadyFetchedQuery, _queryReturnsNewIfNotFound;

		
		// __LLBLGENPRO_USER_CODE_REGION_START PrivateMembers
		// __LLBLGENPRO_USER_CODE_REGION_END
		#endregion

		#region Statics
		private static Dictionary<string, string>	_customProperties;
		private static Dictionary<string, Dictionary<string, string>>	_fieldsCustomProperties;

		/// <summary>All names of fields mapped onto a relation. Usable for in-memory filtering</summary>
		public static class MemberNames
		{
			/// <summary>Member name Attribute</summary>
			public static readonly string Attribute = "Attribute";
			/// <summary>Member name Query</summary>
			public static readonly string Query = "Query";



		}
		#endregion
		
		/// <summary>Static CTor for setting up custom property hashtables. Is executed before the first instance of this entity class or derived classes is constructed. </summary>
		static QueryValueEntity()
		{
			SetupCustomPropertyHashtables();
		}

		/// <summary>CTor</summary>
		public QueryValueEntity()
		{
			InitClassEmpty(null);
		}


		/// <summary>CTor</summary>
		/// <param name="id">PK value for QueryValue which data should be fetched into this QueryValue object</param>
		public QueryValueEntity(System.Int32 id)
		{
			InitClassFetch(id, null, null);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for QueryValue which data should be fetched into this QueryValue object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		public QueryValueEntity(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			InitClassFetch(id, null, prefetchPathToUse);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for QueryValue which data should be fetched into this QueryValue object</param>
		/// <param name="validator">The custom validator object for this QueryValueEntity</param>
		public QueryValueEntity(System.Int32 id, IValidator validator)
		{
			InitClassFetch(id, validator, null);
		}


		/// <summary>Private CTor for deserialization</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		protected QueryValueEntity(SerializationInfo info, StreamingContext context) : base(info, context)
		{


			_attribute = (AttributeEntity)info.GetValue("_attribute", typeof(AttributeEntity));
			if(_attribute!=null)
			{
				_attribute.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_attributeReturnsNewIfNotFound = info.GetBoolean("_attributeReturnsNewIfNotFound");
			_alwaysFetchAttribute = info.GetBoolean("_alwaysFetchAttribute");
			_alreadyFetchedAttribute = info.GetBoolean("_alreadyFetchedAttribute");
			_query = (QueryEntity)info.GetValue("_query", typeof(QueryEntity));
			if(_query!=null)
			{
				_query.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_queryReturnsNewIfNotFound = info.GetBoolean("_queryReturnsNewIfNotFound");
			_alwaysFetchQuery = info.GetBoolean("_alwaysFetchQuery");
			_alreadyFetchedQuery = info.GetBoolean("_alreadyFetchedQuery");

			base.FixupDeserialization(FieldInfoProviderSingleton.GetInstance(), PersistenceInfoProviderSingleton.GetInstance());
			
			// __LLBLGENPRO_USER_CODE_REGION_START DeserializationConstructor
			// __LLBLGENPRO_USER_CODE_REGION_END
		}

		
		/// <summary>Performs the desync setup when an FK field has been changed. The entity referenced based on the FK field will be dereferenced and sync info will be removed.</summary>
		/// <param name="fieldIndex">The fieldindex.</param>
		protected override void PerformDesyncSetupFKFieldChange(int fieldIndex)
		{
			switch((QueryValueFieldIndex)fieldIndex)
			{
				case QueryValueFieldIndex.QueryId:
					DesetupSyncQuery(true, false);
					_alreadyFetchedQuery = false;
					break;
				case QueryValueFieldIndex.AttributeId:
					DesetupSyncAttribute(true, false);
					_alreadyFetchedAttribute = false;
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


			_alreadyFetchedAttribute = (_attribute != null);
			_alreadyFetchedQuery = (_query != null);

		}
				
		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public override RelationCollection GetRelationsForFieldOfType(string fieldName)
		{
			return QueryValueEntity.GetRelationsForField(fieldName);
		}

		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public static RelationCollection GetRelationsForField(string fieldName)
		{
			RelationCollection toReturn = new RelationCollection();
			switch(fieldName)
			{
				case "Attribute":
					toReturn.Add(QueryValueEntity.Relations.AttributeEntityUsingAttributeId);
					break;
				case "Query":
					toReturn.Add(QueryValueEntity.Relations.QueryEntityUsingQueryId);
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


			info.AddValue("_attribute", (!this.MarkedForDeletion?_attribute:null));
			info.AddValue("_attributeReturnsNewIfNotFound", _attributeReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchAttribute", _alwaysFetchAttribute);
			info.AddValue("_alreadyFetchedAttribute", _alreadyFetchedAttribute);
			info.AddValue("_query", (!this.MarkedForDeletion?_query:null));
			info.AddValue("_queryReturnsNewIfNotFound", _queryReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchQuery", _alwaysFetchQuery);
			info.AddValue("_alreadyFetchedQuery", _alreadyFetchedQuery);

			
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
				case "Attribute":
					_alreadyFetchedAttribute = true;
					this.Attribute = (AttributeEntity)entity;
					break;
				case "Query":
					_alreadyFetchedQuery = true;
					this.Query = (QueryEntity)entity;
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
				case "Attribute":
					SetupSyncAttribute(relatedEntity);
					break;
				case "Query":
					SetupSyncQuery(relatedEntity);
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
				case "Attribute":
					DesetupSyncAttribute(false, true);
					break;
				case "Query":
					DesetupSyncQuery(false, true);
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
			if(_attribute!=null)
			{
				toReturn.Add(_attribute);
			}
			if(_query!=null)
			{
				toReturn.Add(_query);
			}


			return toReturn;
		}
		
		/// <summary> Gets a List of all entity collections stored as member variables in this entity. The contents of the ArrayList is
		/// used by the DataAccessAdapter to perform recursive saves. Only 1:n related collections are returned.</summary>
		/// <returns>Collection with 0 or more IEntityCollection objects, referenced by this entity</returns>
		public override List<IEntityCollection> GetMemberEntityCollections()
		{
			List<IEntityCollection> toReturn = new List<IEntityCollection>();


			return toReturn;
		}

		

		

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for QueryValue which data should be fetched into this QueryValue object</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id)
		{
			return FetchUsingPK(id, null, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for QueryValue which data should be fetched into this QueryValue object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			return FetchUsingPK(id, prefetchPathToUse, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for QueryValue which data should be fetched into this QueryValue object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse)
		{
			return Fetch(id, prefetchPathToUse, contextToUse, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for QueryValue which data should be fetched into this QueryValue object</param>
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
		public bool TestOriginalFieldValueForNull(QueryValueFieldIndex fieldIndex)
		{
			return base.Fields[(int)fieldIndex].IsNull;
		}
		
		/// <summary>Returns true if the current value for the field with the fieldIndex passed in represents null/not defined, false otherwise.
		/// Should not be used for testing if the original value (read from the db) is NULL</summary>
		/// <param name="fieldIndex">Index of the field to test if its currentvalue is null/undefined</param>
		/// <returns>true if the field's value isn't defined yet, false otherwise</returns>
		public bool TestCurrentFieldValueForNull(QueryValueFieldIndex fieldIndex)
		{
			return base.CheckIfCurrentFieldValueIsNull((int)fieldIndex);
		}

				
		/// <summary>Gets a list of all the EntityRelation objects the type of this instance has.</summary>
		/// <returns>A list of all the EntityRelation objects the type of this instance has. Hierarchy relations are excluded.</returns>
		public override List<IEntityRelation> GetAllRelations()
		{
			return new QueryValueRelations().GetAllRelations();
		}




		/// <summary> Retrieves the related entity of type 'AttributeEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'AttributeEntity' which is related to this entity.</returns>
		public AttributeEntity GetSingleAttribute()
		{
			return GetSingleAttribute(false);
		}

		/// <summary> Retrieves the related entity of type 'AttributeEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'AttributeEntity' which is related to this entity.</returns>
		public virtual AttributeEntity GetSingleAttribute(bool forceFetch)
		{
			if( ( !_alreadyFetchedAttribute || forceFetch || _alwaysFetchAttribute) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(QueryValueEntity.Relations.AttributeEntityUsingAttributeId);

				AttributeEntity newEntity = new AttributeEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.AttributeId);
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (AttributeEntity)base.ActiveContext.Get(newEntity);
					}
					this.Attribute = newEntity;
				}
				else
				{
					if(_attributeReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_attribute == null)))
						{
							this.Attribute = newEntity;
						}
					}
					else
					{
						this.Attribute = null;
					}
				}
				_alreadyFetchedAttribute = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _attribute;
		}

		/// <summary> Retrieves the related entity of type 'QueryEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'QueryEntity' which is related to this entity.</returns>
		public QueryEntity GetSingleQuery()
		{
			return GetSingleQuery(false);
		}

		/// <summary> Retrieves the related entity of type 'QueryEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'QueryEntity' which is related to this entity.</returns>
		public virtual QueryEntity GetSingleQuery(bool forceFetch)
		{
			if( ( !_alreadyFetchedQuery || forceFetch || _alwaysFetchQuery) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(QueryValueEntity.Relations.QueryEntityUsingQueryId);

				QueryEntity newEntity = new QueryEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.QueryId);
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (QueryEntity)base.ActiveContext.Get(newEntity);
					}
					this.Query = newEntity;
				}
				else
				{
					if(_queryReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_query == null)))
						{
							this.Query = newEntity;
						}
					}
					else
					{
						this.Query = null;
					}
				}
				_alreadyFetchedQuery = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _query;
		}


		/// <summary> Performs the insert action of a new Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool InsertEntity()
		{
			QueryValueDAO dao = (QueryValueDAO)CreateDAOInstance();
			return dao.AddNew(base.Fields, base.Transaction);
		}
		
		/// <summary> Adds the internals to the active context. </summary>
		protected override void AddInternalsToContext()
		{


			if(_attribute!=null)
			{
				_attribute.ActiveContext = base.ActiveContext;
			}
			if(_query!=null)
			{
				_query.ActiveContext = base.ActiveContext;
			}


		}


		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity()
		{
			QueryValueDAO dao = (QueryValueDAO)CreateDAOInstance();
			return dao.UpdateExisting(base.Fields, base.Transaction);
		}
		
		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <param name="updateRestriction">Predicate expression, meant for concurrency checks in an Update query</param>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity(IPredicate updateRestriction)
		{
			QueryValueDAO dao = (QueryValueDAO)CreateDAOInstance();
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
			return EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.QueryValueEntity);
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
			toReturn.Add("Attribute", _attribute);
			toReturn.Add("Query", _query);



			return toReturn;
		}
		

		/// <summary> Initializes the the entity and fetches the data related to the entity in this entity.</summary>
		/// <param name="id">PK value for QueryValue which data should be fetched into this QueryValue object</param>
		/// <param name="validator">The validator object for this QueryValueEntity</param>
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


			_attribute = null;
			_attributeReturnsNewIfNotFound = true;
			_alwaysFetchAttribute = false;
			_alreadyFetchedAttribute = false;
			_query = null;
			_queryReturnsNewIfNotFound = true;
			_alwaysFetchQuery = false;
			_alreadyFetchedQuery = false;


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

			_fieldsCustomProperties.Add("QueryId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("AttributeId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Extra", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Value", fieldHashtable);
		}
		#endregion


		/// <summary> Removes the sync logic for member _attribute</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncAttribute(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _attribute, new PropertyChangedEventHandler( OnAttributePropertyChanged ), "Attribute", QueryValueEntity.Relations.AttributeEntityUsingAttributeId, true, signalRelatedEntity, "QueryValue", resetFKFields, new int[] { (int)QueryValueFieldIndex.AttributeId } );		
			_attribute = null;
		}
		
		/// <summary> setups the sync logic for member _attribute</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncAttribute(IEntity relatedEntity)
		{
			if(_attribute!=relatedEntity)
			{		
				DesetupSyncAttribute(true, true);
				_attribute = (AttributeEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _attribute, new PropertyChangedEventHandler( OnAttributePropertyChanged ), "Attribute", QueryValueEntity.Relations.AttributeEntityUsingAttributeId, true, ref _alreadyFetchedAttribute, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnAttributePropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}

		/// <summary> Removes the sync logic for member _query</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncQuery(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _query, new PropertyChangedEventHandler( OnQueryPropertyChanged ), "Query", QueryValueEntity.Relations.QueryEntityUsingQueryId, true, signalRelatedEntity, "QueryValue", resetFKFields, new int[] { (int)QueryValueFieldIndex.QueryId } );		
			_query = null;
		}
		
		/// <summary> setups the sync logic for member _query</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncQuery(IEntity relatedEntity)
		{
			if(_query!=relatedEntity)
			{		
				DesetupSyncQuery(true, true);
				_query = (QueryEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _query, new PropertyChangedEventHandler( OnQueryPropertyChanged ), "Query", QueryValueEntity.Relations.QueryEntityUsingQueryId, true, ref _alreadyFetchedQuery, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnQueryPropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}


		/// <summary> Fetches the entity from the persistent storage. Fetch simply reads the entity into an EntityFields object. </summary>
		/// <param name="id">PK value for QueryValue which data should be fetched into this QueryValue object</param>
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
				base.Fields[(int)QueryValueFieldIndex.Id].ForcedCurrentValueWrite(id);
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
			return DAOFactory.CreateQueryValueDAO();
		}
		
		/// <summary> Creates the entity factory for this type.</summary>
		/// <returns></returns>
		protected override IEntityFactory CreateEntityFactory()
		{
			return new QueryValueEntityFactory();
		}

		#region Class Property Declarations
		/// <summary> The relations object holding all relations of this entity with other entity classes.</summary>
		public  static QueryValueRelations Relations
		{
			get	{ return new QueryValueRelations(); }
		}
		
		/// <summary> The custom properties for this entity type.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		public  static Dictionary<string, string> CustomProperties
		{
			get { return _customProperties;}
		}




		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Attribute' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathAttribute
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.AttributeCollection(),
					(IEntityRelation)GetRelationsForField("Attribute")[0], (int)policyDB.EntityType.QueryValueEntity, (int)policyDB.EntityType.AttributeEntity, 0, null, null, null, "Attribute", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Query' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathQuery
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.QueryCollection(),
					(IEntityRelation)GetRelationsForField("Query")[0], (int)policyDB.EntityType.QueryValueEntity, (int)policyDB.EntityType.QueryEntity, 0, null, null, null, "Query", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}


		/// <summary>Returns the full name for this entity, which is important for the DAO to find back persistence info for this entity.</summary>
		[Browsable(false), XmlIgnore]
		public override string LLBLGenProEntityName
		{
			get { return "QueryValueEntity";}
		}

		/// <summary> The custom properties for the type of this entity instance.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		[Browsable(false), XmlIgnore]
		public override Dictionary<string, string> CustomPropertiesOfType
		{
			get { return QueryValueEntity.CustomProperties;}
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
			get { return QueryValueEntity.FieldsCustomProperties;}
		}

		/// <summary> The Id property of the Entity QueryValue<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "queryValue"."id"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, true, true</remarks>
		public virtual System.Int32 Id
		{
			get { return (System.Int32)GetValue((int)QueryValueFieldIndex.Id, true); }
			set	{ SetValue((int)QueryValueFieldIndex.Id, value, true); }
		}
		/// <summary> The QueryId property of the Entity QueryValue<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "queryValue"."queryId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 QueryId
		{
			get { return (System.Int32)GetValue((int)QueryValueFieldIndex.QueryId, true); }
			set	{ SetValue((int)QueryValueFieldIndex.QueryId, value, true); }
		}
		/// <summary> The AttributeId property of the Entity QueryValue<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "queryValue"."attributeId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 AttributeId
		{
			get { return (System.Int32)GetValue((int)QueryValueFieldIndex.AttributeId, true); }
			set	{ SetValue((int)QueryValueFieldIndex.AttributeId, value, true); }
		}
		/// <summary> The Extra property of the Entity QueryValue<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "queryValue"."extra"<br/>
		/// Table field type characteristics (type, precision, scale, length): NVarChar, 0, 0, 250<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): true, false, false</remarks>
		public virtual System.String Extra
		{
			get { return (System.String)GetValue((int)QueryValueFieldIndex.Extra, true); }
			set	{ SetValue((int)QueryValueFieldIndex.Extra, value, true); }
		}
		/// <summary> The Value property of the Entity QueryValue<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "queryValue"."value"<br/>
		/// Table field type characteristics (type, precision, scale, length): NVarChar, 0, 0, 500<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.String Value
		{
			get { return (System.String)GetValue((int)QueryValueFieldIndex.Value, true); }
			set	{ SetValue((int)QueryValueFieldIndex.Value, value, true); }
		}



		/// <summary> Gets / sets related entity of type 'AttributeEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleAttribute()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual AttributeEntity Attribute
		{
			get	{ return GetSingleAttribute(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncAttribute(value);
				}
				else
				{
					if(value==null)
					{
						if(_attribute != null)
						{
							_attribute.UnsetRelatedEntity(this, "QueryValue");
						}
					}
					else
					{
						if(_attribute!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "QueryValue");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for Attribute. When set to true, Attribute is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Attribute is accessed. You can always execute
		/// a forced fetch by calling GetSingleAttribute(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchAttribute
		{
			get	{ return _alwaysFetchAttribute; }
			set	{ _alwaysFetchAttribute = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property Attribute already has been fetched. Setting this property to false when Attribute has been fetched
		/// will set Attribute to null as well. Setting this property to true while Attribute hasn't been fetched disables lazy loading for Attribute</summary>
		[Browsable(false)]
		public bool AlreadyFetchedAttribute
		{
			get { return _alreadyFetchedAttribute;}
			set 
			{
				if(_alreadyFetchedAttribute && !value)
				{
					this.Attribute = null;
				}
				_alreadyFetchedAttribute = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property Attribute is not found
		/// in the database. When set to true, Attribute will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool AttributeReturnsNewIfNotFound
		{
			get	{ return _attributeReturnsNewIfNotFound; }
			set { _attributeReturnsNewIfNotFound = value; }	
		}
		/// <summary> Gets / sets related entity of type 'QueryEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleQuery()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual QueryEntity Query
		{
			get	{ return GetSingleQuery(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncQuery(value);
				}
				else
				{
					if(value==null)
					{
						if(_query != null)
						{
							_query.UnsetRelatedEntity(this, "QueryValue");
						}
					}
					else
					{
						if(_query!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "QueryValue");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for Query. When set to true, Query is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Query is accessed. You can always execute
		/// a forced fetch by calling GetSingleQuery(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchQuery
		{
			get	{ return _alwaysFetchQuery; }
			set	{ _alwaysFetchQuery = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property Query already has been fetched. Setting this property to false when Query has been fetched
		/// will set Query to null as well. Setting this property to true while Query hasn't been fetched disables lazy loading for Query</summary>
		[Browsable(false)]
		public bool AlreadyFetchedQuery
		{
			get { return _alreadyFetchedQuery;}
			set 
			{
				if(_alreadyFetchedQuery && !value)
				{
					this.Query = null;
				}
				_alreadyFetchedQuery = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property Query is not found
		/// in the database. When set to true, Query will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool QueryReturnsNewIfNotFound
		{
			get	{ return _queryReturnsNewIfNotFound; }
			set { _queryReturnsNewIfNotFound = value; }	
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
			get { return (int)policyDB.EntityType.QueryValueEntity; }
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
