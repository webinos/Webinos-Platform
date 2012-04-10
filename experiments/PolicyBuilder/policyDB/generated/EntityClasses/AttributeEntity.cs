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
	/// Entity class which represents the entity 'Attribute'. <br/><br/>
	/// 
	/// </summary>
	[Serializable]
	public partial class AttributeEntity : CommonEntityBase, ISerializable
		// __LLBLGENPRO_USER_CODE_REGION_START AdditionalInterfaces
		// __LLBLGENPRO_USER_CODE_REGION_END	
	{
		#region Class Member Declarations
		private policyDB.CollectionClasses.AttributeValueCollection	_attributeValue;
		private bool	_alwaysFetchAttributeValue, _alreadyFetchedAttributeValue;
		private policyDB.CollectionClasses.DecisionNodeCollection	_decisionNode;
		private bool	_alwaysFetchDecisionNode, _alreadyFetchedDecisionNode;
		private policyDB.CollectionClasses.QueryValueCollection	_queryValue;
		private bool	_alwaysFetchQueryValue, _alreadyFetchedQueryValue;
		private policyDB.CollectionClasses.DecisionNodeCollection _decisionNodeCollectionViaDecisionNode;
		private bool	_alwaysFetchDecisionNodeCollectionViaDecisionNode, _alreadyFetchedDecisionNodeCollectionViaDecisionNode;
		private policyDB.CollectionClasses.DecisionNodeCollection _decisionNodeCollectionViaAttributeValue;
		private bool	_alwaysFetchDecisionNodeCollectionViaAttributeValue, _alreadyFetchedDecisionNodeCollectionViaAttributeValue;
		private policyDB.CollectionClasses.QueryCollection _queryCollectionViaQueryValue;
		private bool	_alwaysFetchQueryCollectionViaQueryValue, _alreadyFetchedQueryCollectionViaQueryValue;
		private AttributeTypeEntity _attributeType;
		private bool	_alwaysFetchAttributeType, _alreadyFetchedAttributeType, _attributeTypeReturnsNewIfNotFound;
		private ContextEntity _context;
		private bool	_alwaysFetchContext, _alreadyFetchedContext, _contextReturnsNewIfNotFound;

		
		// __LLBLGENPRO_USER_CODE_REGION_START PrivateMembers
		// __LLBLGENPRO_USER_CODE_REGION_END
		#endregion

		#region Statics
		private static Dictionary<string, string>	_customProperties;
		private static Dictionary<string, Dictionary<string, string>>	_fieldsCustomProperties;

		/// <summary>All names of fields mapped onto a relation. Usable for in-memory filtering</summary>
		public static class MemberNames
		{
			/// <summary>Member name AttributeType</summary>
			public static readonly string AttributeType = "AttributeType";
			/// <summary>Member name Context</summary>
			public static readonly string Context = "Context";
			/// <summary>Member name AttributeValue</summary>
			public static readonly string AttributeValue = "AttributeValue";
			/// <summary>Member name DecisionNode</summary>
			public static readonly string DecisionNode = "DecisionNode";
			/// <summary>Member name QueryValue</summary>
			public static readonly string QueryValue = "QueryValue";
			/// <summary>Member name DecisionNodeCollectionViaDecisionNode</summary>
			public static readonly string DecisionNodeCollectionViaDecisionNode = "DecisionNodeCollectionViaDecisionNode";
			/// <summary>Member name DecisionNodeCollectionViaAttributeValue</summary>
			public static readonly string DecisionNodeCollectionViaAttributeValue = "DecisionNodeCollectionViaAttributeValue";
			/// <summary>Member name QueryCollectionViaQueryValue</summary>
			public static readonly string QueryCollectionViaQueryValue = "QueryCollectionViaQueryValue";

		}
		#endregion
		
		/// <summary>Static CTor for setting up custom property hashtables. Is executed before the first instance of this entity class or derived classes is constructed. </summary>
		static AttributeEntity()
		{
			SetupCustomPropertyHashtables();
		}

		/// <summary>CTor</summary>
		public AttributeEntity()
		{
			InitClassEmpty(null);
		}


		/// <summary>CTor</summary>
		/// <param name="id">PK value for Attribute which data should be fetched into this Attribute object</param>
		public AttributeEntity(System.Int32 id)
		{
			InitClassFetch(id, null, null);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for Attribute which data should be fetched into this Attribute object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		public AttributeEntity(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			InitClassFetch(id, null, prefetchPathToUse);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for Attribute which data should be fetched into this Attribute object</param>
		/// <param name="validator">The custom validator object for this AttributeEntity</param>
		public AttributeEntity(System.Int32 id, IValidator validator)
		{
			InitClassFetch(id, validator, null);
		}


		/// <summary>Private CTor for deserialization</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		protected AttributeEntity(SerializationInfo info, StreamingContext context) : base(info, context)
		{
			_attributeValue = (policyDB.CollectionClasses.AttributeValueCollection)info.GetValue("_attributeValue", typeof(policyDB.CollectionClasses.AttributeValueCollection));
			_alwaysFetchAttributeValue = info.GetBoolean("_alwaysFetchAttributeValue");
			_alreadyFetchedAttributeValue = info.GetBoolean("_alreadyFetchedAttributeValue");
			_decisionNode = (policyDB.CollectionClasses.DecisionNodeCollection)info.GetValue("_decisionNode", typeof(policyDB.CollectionClasses.DecisionNodeCollection));
			_alwaysFetchDecisionNode = info.GetBoolean("_alwaysFetchDecisionNode");
			_alreadyFetchedDecisionNode = info.GetBoolean("_alreadyFetchedDecisionNode");
			_queryValue = (policyDB.CollectionClasses.QueryValueCollection)info.GetValue("_queryValue", typeof(policyDB.CollectionClasses.QueryValueCollection));
			_alwaysFetchQueryValue = info.GetBoolean("_alwaysFetchQueryValue");
			_alreadyFetchedQueryValue = info.GetBoolean("_alreadyFetchedQueryValue");
			_decisionNodeCollectionViaDecisionNode = (policyDB.CollectionClasses.DecisionNodeCollection)info.GetValue("_decisionNodeCollectionViaDecisionNode", typeof(policyDB.CollectionClasses.DecisionNodeCollection));
			_alwaysFetchDecisionNodeCollectionViaDecisionNode = info.GetBoolean("_alwaysFetchDecisionNodeCollectionViaDecisionNode");
			_alreadyFetchedDecisionNodeCollectionViaDecisionNode = info.GetBoolean("_alreadyFetchedDecisionNodeCollectionViaDecisionNode");
			_decisionNodeCollectionViaAttributeValue = (policyDB.CollectionClasses.DecisionNodeCollection)info.GetValue("_decisionNodeCollectionViaAttributeValue", typeof(policyDB.CollectionClasses.DecisionNodeCollection));
			_alwaysFetchDecisionNodeCollectionViaAttributeValue = info.GetBoolean("_alwaysFetchDecisionNodeCollectionViaAttributeValue");
			_alreadyFetchedDecisionNodeCollectionViaAttributeValue = info.GetBoolean("_alreadyFetchedDecisionNodeCollectionViaAttributeValue");
			_queryCollectionViaQueryValue = (policyDB.CollectionClasses.QueryCollection)info.GetValue("_queryCollectionViaQueryValue", typeof(policyDB.CollectionClasses.QueryCollection));
			_alwaysFetchQueryCollectionViaQueryValue = info.GetBoolean("_alwaysFetchQueryCollectionViaQueryValue");
			_alreadyFetchedQueryCollectionViaQueryValue = info.GetBoolean("_alreadyFetchedQueryCollectionViaQueryValue");
			_attributeType = (AttributeTypeEntity)info.GetValue("_attributeType", typeof(AttributeTypeEntity));
			if(_attributeType!=null)
			{
				_attributeType.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_attributeTypeReturnsNewIfNotFound = info.GetBoolean("_attributeTypeReturnsNewIfNotFound");
			_alwaysFetchAttributeType = info.GetBoolean("_alwaysFetchAttributeType");
			_alreadyFetchedAttributeType = info.GetBoolean("_alreadyFetchedAttributeType");
			_context = (ContextEntity)info.GetValue("_context", typeof(ContextEntity));
			if(_context!=null)
			{
				_context.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_contextReturnsNewIfNotFound = info.GetBoolean("_contextReturnsNewIfNotFound");
			_alwaysFetchContext = info.GetBoolean("_alwaysFetchContext");
			_alreadyFetchedContext = info.GetBoolean("_alreadyFetchedContext");

			base.FixupDeserialization(FieldInfoProviderSingleton.GetInstance(), PersistenceInfoProviderSingleton.GetInstance());
			
			// __LLBLGENPRO_USER_CODE_REGION_START DeserializationConstructor
			// __LLBLGENPRO_USER_CODE_REGION_END
		}

		
		/// <summary>Performs the desync setup when an FK field has been changed. The entity referenced based on the FK field will be dereferenced and sync info will be removed.</summary>
		/// <param name="fieldIndex">The fieldindex.</param>
		protected override void PerformDesyncSetupFKFieldChange(int fieldIndex)
		{
			switch((AttributeFieldIndex)fieldIndex)
			{
				case AttributeFieldIndex.AttributeTypeId:
					DesetupSyncAttributeType(true, false);
					_alreadyFetchedAttributeType = false;
					break;
				case AttributeFieldIndex.ContextId:
					DesetupSyncContext(true, false);
					_alreadyFetchedContext = false;
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
			_alreadyFetchedAttributeValue = (_attributeValue.Count > 0);
			_alreadyFetchedDecisionNode = (_decisionNode.Count > 0);
			_alreadyFetchedQueryValue = (_queryValue.Count > 0);
			_alreadyFetchedDecisionNodeCollectionViaDecisionNode = (_decisionNodeCollectionViaDecisionNode.Count > 0);
			_alreadyFetchedDecisionNodeCollectionViaAttributeValue = (_decisionNodeCollectionViaAttributeValue.Count > 0);
			_alreadyFetchedQueryCollectionViaQueryValue = (_queryCollectionViaQueryValue.Count > 0);
			_alreadyFetchedAttributeType = (_attributeType != null);
			_alreadyFetchedContext = (_context != null);

		}
				
		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public override RelationCollection GetRelationsForFieldOfType(string fieldName)
		{
			return AttributeEntity.GetRelationsForField(fieldName);
		}

		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public static RelationCollection GetRelationsForField(string fieldName)
		{
			RelationCollection toReturn = new RelationCollection();
			switch(fieldName)
			{
				case "AttributeType":
					toReturn.Add(AttributeEntity.Relations.AttributeTypeEntityUsingAttributeTypeId);
					break;
				case "Context":
					toReturn.Add(AttributeEntity.Relations.ContextEntityUsingContextId);
					break;
				case "AttributeValue":
					toReturn.Add(AttributeEntity.Relations.AttributeValueEntityUsingAttributeId);
					break;
				case "DecisionNode":
					toReturn.Add(AttributeEntity.Relations.DecisionNodeEntityUsingAttributeId);
					break;
				case "QueryValue":
					toReturn.Add(AttributeEntity.Relations.QueryValueEntityUsingAttributeId);
					break;
				case "DecisionNodeCollectionViaDecisionNode":
					toReturn.Add(AttributeEntity.Relations.DecisionNodeEntityUsingAttributeId, "AttributeEntity__", "DecisionNode_", JoinHint.None);
					toReturn.Add(DecisionNodeEntity.Relations.DecisionNodeEntityUsingParentId, "DecisionNode_", string.Empty, JoinHint.None);
					break;
				case "DecisionNodeCollectionViaAttributeValue":
					toReturn.Add(AttributeEntity.Relations.AttributeValueEntityUsingAttributeId, "AttributeEntity__", "AttributeValue_", JoinHint.None);
					toReturn.Add(AttributeValueEntity.Relations.DecisionNodeEntityUsingAttributeMatchId, "AttributeValue_", string.Empty, JoinHint.None);
					break;
				case "QueryCollectionViaQueryValue":
					toReturn.Add(AttributeEntity.Relations.QueryValueEntityUsingAttributeId, "AttributeEntity__", "QueryValue_", JoinHint.None);
					toReturn.Add(QueryValueEntity.Relations.QueryEntityUsingQueryId, "QueryValue_", string.Empty, JoinHint.None);
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
			info.AddValue("_attributeValue", (!this.MarkedForDeletion?_attributeValue:null));
			info.AddValue("_alwaysFetchAttributeValue", _alwaysFetchAttributeValue);
			info.AddValue("_alreadyFetchedAttributeValue", _alreadyFetchedAttributeValue);
			info.AddValue("_decisionNode", (!this.MarkedForDeletion?_decisionNode:null));
			info.AddValue("_alwaysFetchDecisionNode", _alwaysFetchDecisionNode);
			info.AddValue("_alreadyFetchedDecisionNode", _alreadyFetchedDecisionNode);
			info.AddValue("_queryValue", (!this.MarkedForDeletion?_queryValue:null));
			info.AddValue("_alwaysFetchQueryValue", _alwaysFetchQueryValue);
			info.AddValue("_alreadyFetchedQueryValue", _alreadyFetchedQueryValue);
			info.AddValue("_decisionNodeCollectionViaDecisionNode", (!this.MarkedForDeletion?_decisionNodeCollectionViaDecisionNode:null));
			info.AddValue("_alwaysFetchDecisionNodeCollectionViaDecisionNode", _alwaysFetchDecisionNodeCollectionViaDecisionNode);
			info.AddValue("_alreadyFetchedDecisionNodeCollectionViaDecisionNode", _alreadyFetchedDecisionNodeCollectionViaDecisionNode);
			info.AddValue("_decisionNodeCollectionViaAttributeValue", (!this.MarkedForDeletion?_decisionNodeCollectionViaAttributeValue:null));
			info.AddValue("_alwaysFetchDecisionNodeCollectionViaAttributeValue", _alwaysFetchDecisionNodeCollectionViaAttributeValue);
			info.AddValue("_alreadyFetchedDecisionNodeCollectionViaAttributeValue", _alreadyFetchedDecisionNodeCollectionViaAttributeValue);
			info.AddValue("_queryCollectionViaQueryValue", (!this.MarkedForDeletion?_queryCollectionViaQueryValue:null));
			info.AddValue("_alwaysFetchQueryCollectionViaQueryValue", _alwaysFetchQueryCollectionViaQueryValue);
			info.AddValue("_alreadyFetchedQueryCollectionViaQueryValue", _alreadyFetchedQueryCollectionViaQueryValue);
			info.AddValue("_attributeType", (!this.MarkedForDeletion?_attributeType:null));
			info.AddValue("_attributeTypeReturnsNewIfNotFound", _attributeTypeReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchAttributeType", _alwaysFetchAttributeType);
			info.AddValue("_alreadyFetchedAttributeType", _alreadyFetchedAttributeType);
			info.AddValue("_context", (!this.MarkedForDeletion?_context:null));
			info.AddValue("_contextReturnsNewIfNotFound", _contextReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchContext", _alwaysFetchContext);
			info.AddValue("_alreadyFetchedContext", _alreadyFetchedContext);

			
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
				case "AttributeType":
					_alreadyFetchedAttributeType = true;
					this.AttributeType = (AttributeTypeEntity)entity;
					break;
				case "Context":
					_alreadyFetchedContext = true;
					this.Context = (ContextEntity)entity;
					break;
				case "AttributeValue":
					_alreadyFetchedAttributeValue = true;
					if(entity!=null)
					{
						this.AttributeValue.Add((AttributeValueEntity)entity);
					}
					break;
				case "DecisionNode":
					_alreadyFetchedDecisionNode = true;
					if(entity!=null)
					{
						this.DecisionNode.Add((DecisionNodeEntity)entity);
					}
					break;
				case "QueryValue":
					_alreadyFetchedQueryValue = true;
					if(entity!=null)
					{
						this.QueryValue.Add((QueryValueEntity)entity);
					}
					break;
				case "DecisionNodeCollectionViaDecisionNode":
					_alreadyFetchedDecisionNodeCollectionViaDecisionNode = true;
					if(entity!=null)
					{
						this.DecisionNodeCollectionViaDecisionNode.Add((DecisionNodeEntity)entity);
					}
					break;
				case "DecisionNodeCollectionViaAttributeValue":
					_alreadyFetchedDecisionNodeCollectionViaAttributeValue = true;
					if(entity!=null)
					{
						this.DecisionNodeCollectionViaAttributeValue.Add((DecisionNodeEntity)entity);
					}
					break;
				case "QueryCollectionViaQueryValue":
					_alreadyFetchedQueryCollectionViaQueryValue = true;
					if(entity!=null)
					{
						this.QueryCollectionViaQueryValue.Add((QueryEntity)entity);
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
				case "AttributeType":
					SetupSyncAttributeType(relatedEntity);
					break;
				case "Context":
					SetupSyncContext(relatedEntity);
					break;
				case "AttributeValue":
					_attributeValue.Add((AttributeValueEntity)relatedEntity);
					break;
				case "DecisionNode":
					_decisionNode.Add((DecisionNodeEntity)relatedEntity);
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
				case "AttributeType":
					DesetupSyncAttributeType(false, true);
					break;
				case "Context":
					DesetupSyncContext(false, true);
					break;
				case "AttributeValue":
					base.PerformRelatedEntityRemoval(_attributeValue, relatedEntity, signalRelatedEntityManyToOne);
					break;
				case "DecisionNode":
					base.PerformRelatedEntityRemoval(_decisionNode, relatedEntity, signalRelatedEntityManyToOne);
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
			if(_attributeType!=null)
			{
				toReturn.Add(_attributeType);
			}
			if(_context!=null)
			{
				toReturn.Add(_context);
			}


			return toReturn;
		}
		
		/// <summary> Gets a List of all entity collections stored as member variables in this entity. The contents of the ArrayList is
		/// used by the DataAccessAdapter to perform recursive saves. Only 1:n related collections are returned.</summary>
		/// <returns>Collection with 0 or more IEntityCollection objects, referenced by this entity</returns>
		public override List<IEntityCollection> GetMemberEntityCollections()
		{
			List<IEntityCollection> toReturn = new List<IEntityCollection>();
			toReturn.Add(_attributeValue);
			toReturn.Add(_decisionNode);
			toReturn.Add(_queryValue);

			return toReturn;
		}

		

		

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Attribute which data should be fetched into this Attribute object</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id)
		{
			return FetchUsingPK(id, null, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Attribute which data should be fetched into this Attribute object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			return FetchUsingPK(id, prefetchPathToUse, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Attribute which data should be fetched into this Attribute object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse)
		{
			return Fetch(id, prefetchPathToUse, contextToUse, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Attribute which data should be fetched into this Attribute object</param>
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
		public bool TestOriginalFieldValueForNull(AttributeFieldIndex fieldIndex)
		{
			return base.Fields[(int)fieldIndex].IsNull;
		}
		
		/// <summary>Returns true if the current value for the field with the fieldIndex passed in represents null/not defined, false otherwise.
		/// Should not be used for testing if the original value (read from the db) is NULL</summary>
		/// <param name="fieldIndex">Index of the field to test if its currentvalue is null/undefined</param>
		/// <returns>true if the field's value isn't defined yet, false otherwise</returns>
		public bool TestCurrentFieldValueForNull(AttributeFieldIndex fieldIndex)
		{
			return base.CheckIfCurrentFieldValueIsNull((int)fieldIndex);
		}

				
		/// <summary>Gets a list of all the EntityRelation objects the type of this instance has.</summary>
		/// <returns>A list of all the EntityRelation objects the type of this instance has. Hierarchy relations are excluded.</returns>
		public override List<IEntityRelation> GetAllRelations()
		{
			return new AttributeRelations().GetAllRelations();
		}


		/// <summary> Retrieves all related entities of type 'AttributeValueEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'AttributeValueEntity'</returns>
		public policyDB.CollectionClasses.AttributeValueCollection GetMultiAttributeValue(bool forceFetch)
		{
			return GetMultiAttributeValue(forceFetch, _attributeValue.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'AttributeValueEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'AttributeValueEntity'</returns>
		public policyDB.CollectionClasses.AttributeValueCollection GetMultiAttributeValue(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiAttributeValue(forceFetch, _attributeValue.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'AttributeValueEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.AttributeValueCollection GetMultiAttributeValue(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiAttributeValue(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'AttributeValueEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.AttributeValueCollection GetMultiAttributeValue(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedAttributeValue || forceFetch || _alwaysFetchAttributeValue) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_attributeValue.ParticipatesInTransaction)
					{
						base.Transaction.Add(_attributeValue);
					}
				}
				_attributeValue.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_attributeValue.EntityFactoryToUse = entityFactoryToUse;
				}
				_attributeValue.GetMultiManyToOne(this, null, filter);
				_attributeValue.SuppressClearInGetMulti=false;
				_alreadyFetchedAttributeValue = true;
			}
			return _attributeValue;
		}

		/// <summary> Sets the collection parameters for the collection for 'AttributeValue'. These settings will be taken into account
		/// when the property AttributeValue is requested or GetMultiAttributeValue is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersAttributeValue(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_attributeValue.SortClauses=sortClauses;
			_attributeValue.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'DecisionNodeEntity'</returns>
		public policyDB.CollectionClasses.DecisionNodeCollection GetMultiDecisionNode(bool forceFetch)
		{
			return GetMultiDecisionNode(forceFetch, _decisionNode.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'DecisionNodeEntity'</returns>
		public policyDB.CollectionClasses.DecisionNodeCollection GetMultiDecisionNode(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiDecisionNode(forceFetch, _decisionNode.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.DecisionNodeCollection GetMultiDecisionNode(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiDecisionNode(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.DecisionNodeCollection GetMultiDecisionNode(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedDecisionNode || forceFetch || _alwaysFetchDecisionNode) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_decisionNode.ParticipatesInTransaction)
					{
						base.Transaction.Add(_decisionNode);
					}
				}
				_decisionNode.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_decisionNode.EntityFactoryToUse = entityFactoryToUse;
				}
				_decisionNode.GetMultiManyToOne(this, null, filter);
				_decisionNode.SuppressClearInGetMulti=false;
				_alreadyFetchedDecisionNode = true;
			}
			return _decisionNode;
		}

		/// <summary> Sets the collection parameters for the collection for 'DecisionNode'. These settings will be taken into account
		/// when the property DecisionNode is requested or GetMultiDecisionNode is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersDecisionNode(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_decisionNode.SortClauses=sortClauses;
			_decisionNode.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
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
				_queryValue.GetMultiManyToOne(this, null, filter);
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

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'DecisionNodeEntity'</returns>
		public policyDB.CollectionClasses.DecisionNodeCollection GetMultiDecisionNodeCollectionViaDecisionNode(bool forceFetch)
		{
			return GetMultiDecisionNodeCollectionViaDecisionNode(forceFetch, _decisionNodeCollectionViaDecisionNode.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.DecisionNodeCollection GetMultiDecisionNodeCollectionViaDecisionNode(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedDecisionNodeCollectionViaDecisionNode || forceFetch || _alwaysFetchDecisionNodeCollectionViaDecisionNode) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_decisionNodeCollectionViaDecisionNode.ParticipatesInTransaction)
					{
						base.Transaction.Add(_decisionNodeCollectionViaDecisionNode);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(AttributeFields.Id, ComparisonOperator.Equal, this.Id, "AttributeEntity__"));
				_decisionNodeCollectionViaDecisionNode.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_decisionNodeCollectionViaDecisionNode.EntityFactoryToUse = entityFactoryToUse;
				}
				_decisionNodeCollectionViaDecisionNode.GetMulti(filter, GetRelationsForField("DecisionNodeCollectionViaDecisionNode"));
				_decisionNodeCollectionViaDecisionNode.SuppressClearInGetMulti=false;
				_alreadyFetchedDecisionNodeCollectionViaDecisionNode = true;
			}
			return _decisionNodeCollectionViaDecisionNode;
		}

		/// <summary> Sets the collection parameters for the collection for 'DecisionNodeCollectionViaDecisionNode'. These settings will be taken into account
		/// when the property DecisionNodeCollectionViaDecisionNode is requested or GetMultiDecisionNodeCollectionViaDecisionNode is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersDecisionNodeCollectionViaDecisionNode(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_decisionNodeCollectionViaDecisionNode.SortClauses=sortClauses;
			_decisionNodeCollectionViaDecisionNode.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'DecisionNodeEntity'</returns>
		public policyDB.CollectionClasses.DecisionNodeCollection GetMultiDecisionNodeCollectionViaAttributeValue(bool forceFetch)
		{
			return GetMultiDecisionNodeCollectionViaAttributeValue(forceFetch, _decisionNodeCollectionViaAttributeValue.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.DecisionNodeCollection GetMultiDecisionNodeCollectionViaAttributeValue(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedDecisionNodeCollectionViaAttributeValue || forceFetch || _alwaysFetchDecisionNodeCollectionViaAttributeValue) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_decisionNodeCollectionViaAttributeValue.ParticipatesInTransaction)
					{
						base.Transaction.Add(_decisionNodeCollectionViaAttributeValue);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(AttributeFields.Id, ComparisonOperator.Equal, this.Id, "AttributeEntity__"));
				_decisionNodeCollectionViaAttributeValue.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_decisionNodeCollectionViaAttributeValue.EntityFactoryToUse = entityFactoryToUse;
				}
				_decisionNodeCollectionViaAttributeValue.GetMulti(filter, GetRelationsForField("DecisionNodeCollectionViaAttributeValue"));
				_decisionNodeCollectionViaAttributeValue.SuppressClearInGetMulti=false;
				_alreadyFetchedDecisionNodeCollectionViaAttributeValue = true;
			}
			return _decisionNodeCollectionViaAttributeValue;
		}

		/// <summary> Sets the collection parameters for the collection for 'DecisionNodeCollectionViaAttributeValue'. These settings will be taken into account
		/// when the property DecisionNodeCollectionViaAttributeValue is requested or GetMultiDecisionNodeCollectionViaAttributeValue is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersDecisionNodeCollectionViaAttributeValue(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_decisionNodeCollectionViaAttributeValue.SortClauses=sortClauses;
			_decisionNodeCollectionViaAttributeValue.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'QueryEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'QueryEntity'</returns>
		public policyDB.CollectionClasses.QueryCollection GetMultiQueryCollectionViaQueryValue(bool forceFetch)
		{
			return GetMultiQueryCollectionViaQueryValue(forceFetch, _queryCollectionViaQueryValue.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'QueryEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.QueryCollection GetMultiQueryCollectionViaQueryValue(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedQueryCollectionViaQueryValue || forceFetch || _alwaysFetchQueryCollectionViaQueryValue) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_queryCollectionViaQueryValue.ParticipatesInTransaction)
					{
						base.Transaction.Add(_queryCollectionViaQueryValue);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(AttributeFields.Id, ComparisonOperator.Equal, this.Id, "AttributeEntity__"));
				_queryCollectionViaQueryValue.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_queryCollectionViaQueryValue.EntityFactoryToUse = entityFactoryToUse;
				}
				_queryCollectionViaQueryValue.GetMulti(filter, GetRelationsForField("QueryCollectionViaQueryValue"));
				_queryCollectionViaQueryValue.SuppressClearInGetMulti=false;
				_alreadyFetchedQueryCollectionViaQueryValue = true;
			}
			return _queryCollectionViaQueryValue;
		}

		/// <summary> Sets the collection parameters for the collection for 'QueryCollectionViaQueryValue'. These settings will be taken into account
		/// when the property QueryCollectionViaQueryValue is requested or GetMultiQueryCollectionViaQueryValue is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersQueryCollectionViaQueryValue(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_queryCollectionViaQueryValue.SortClauses=sortClauses;
			_queryCollectionViaQueryValue.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves the related entity of type 'AttributeTypeEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'AttributeTypeEntity' which is related to this entity.</returns>
		public AttributeTypeEntity GetSingleAttributeType()
		{
			return GetSingleAttributeType(false);
		}

		/// <summary> Retrieves the related entity of type 'AttributeTypeEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'AttributeTypeEntity' which is related to this entity.</returns>
		public virtual AttributeTypeEntity GetSingleAttributeType(bool forceFetch)
		{
			if( ( !_alreadyFetchedAttributeType || forceFetch || _alwaysFetchAttributeType) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(AttributeEntity.Relations.AttributeTypeEntityUsingAttributeTypeId);

				AttributeTypeEntity newEntity = new AttributeTypeEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.AttributeTypeId);
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (AttributeTypeEntity)base.ActiveContext.Get(newEntity);
					}
					this.AttributeType = newEntity;
				}
				else
				{
					if(_attributeTypeReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_attributeType == null)))
						{
							this.AttributeType = newEntity;
						}
					}
					else
					{
						this.AttributeType = null;
					}
				}
				_alreadyFetchedAttributeType = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _attributeType;
		}

		/// <summary> Retrieves the related entity of type 'ContextEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'ContextEntity' which is related to this entity.</returns>
		public ContextEntity GetSingleContext()
		{
			return GetSingleContext(false);
		}

		/// <summary> Retrieves the related entity of type 'ContextEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'ContextEntity' which is related to this entity.</returns>
		public virtual ContextEntity GetSingleContext(bool forceFetch)
		{
			if( ( !_alreadyFetchedContext || forceFetch || _alwaysFetchContext) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(AttributeEntity.Relations.ContextEntityUsingContextId);

				ContextEntity newEntity = new ContextEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.ContextId);
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (ContextEntity)base.ActiveContext.Get(newEntity);
					}
					this.Context = newEntity;
				}
				else
				{
					if(_contextReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_context == null)))
						{
							this.Context = newEntity;
						}
					}
					else
					{
						this.Context = null;
					}
				}
				_alreadyFetchedContext = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _context;
		}


		/// <summary> Performs the insert action of a new Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool InsertEntity()
		{
			AttributeDAO dao = (AttributeDAO)CreateDAOInstance();
			return dao.AddNew(base.Fields, base.Transaction);
		}
		
		/// <summary> Adds the internals to the active context. </summary>
		protected override void AddInternalsToContext()
		{
			_attributeValue.ActiveContext = base.ActiveContext;
			_decisionNode.ActiveContext = base.ActiveContext;
			_queryValue.ActiveContext = base.ActiveContext;
			_decisionNodeCollectionViaDecisionNode.ActiveContext = base.ActiveContext;
			_decisionNodeCollectionViaAttributeValue.ActiveContext = base.ActiveContext;
			_queryCollectionViaQueryValue.ActiveContext = base.ActiveContext;
			if(_attributeType!=null)
			{
				_attributeType.ActiveContext = base.ActiveContext;
			}
			if(_context!=null)
			{
				_context.ActiveContext = base.ActiveContext;
			}


		}


		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity()
		{
			AttributeDAO dao = (AttributeDAO)CreateDAOInstance();
			return dao.UpdateExisting(base.Fields, base.Transaction);
		}
		
		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <param name="updateRestriction">Predicate expression, meant for concurrency checks in an Update query</param>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity(IPredicate updateRestriction)
		{
			AttributeDAO dao = (AttributeDAO)CreateDAOInstance();
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
			return EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.AttributeEntity);
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
			toReturn.Add("AttributeType", _attributeType);
			toReturn.Add("Context", _context);
			toReturn.Add("AttributeValue", _attributeValue);
			toReturn.Add("DecisionNode", _decisionNode);
			toReturn.Add("QueryValue", _queryValue);
			toReturn.Add("DecisionNodeCollectionViaDecisionNode", _decisionNodeCollectionViaDecisionNode);
			toReturn.Add("DecisionNodeCollectionViaAttributeValue", _decisionNodeCollectionViaAttributeValue);
			toReturn.Add("QueryCollectionViaQueryValue", _queryCollectionViaQueryValue);

			return toReturn;
		}
		

		/// <summary> Initializes the the entity and fetches the data related to the entity in this entity.</summary>
		/// <param name="id">PK value for Attribute which data should be fetched into this Attribute object</param>
		/// <param name="validator">The validator object for this AttributeEntity</param>
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
			_attributeValue = new policyDB.CollectionClasses.AttributeValueCollection(new AttributeValueEntityFactory());
			_attributeValue.SetContainingEntityInfo(this, "Attribute");
			_alwaysFetchAttributeValue = false;
			_alreadyFetchedAttributeValue = false;
			_decisionNode = new policyDB.CollectionClasses.DecisionNodeCollection(new DecisionNodeEntityFactory());
			_decisionNode.SetContainingEntityInfo(this, "Attribute");
			_alwaysFetchDecisionNode = false;
			_alreadyFetchedDecisionNode = false;
			_queryValue = new policyDB.CollectionClasses.QueryValueCollection(new QueryValueEntityFactory());
			_queryValue.SetContainingEntityInfo(this, "Attribute");
			_alwaysFetchQueryValue = false;
			_alreadyFetchedQueryValue = false;
			_decisionNodeCollectionViaDecisionNode = new policyDB.CollectionClasses.DecisionNodeCollection(new DecisionNodeEntityFactory());
			_alwaysFetchDecisionNodeCollectionViaDecisionNode = false;
			_alreadyFetchedDecisionNodeCollectionViaDecisionNode = false;
			_decisionNodeCollectionViaAttributeValue = new policyDB.CollectionClasses.DecisionNodeCollection(new DecisionNodeEntityFactory());
			_alwaysFetchDecisionNodeCollectionViaAttributeValue = false;
			_alreadyFetchedDecisionNodeCollectionViaAttributeValue = false;
			_queryCollectionViaQueryValue = new policyDB.CollectionClasses.QueryCollection(new QueryEntityFactory());
			_alwaysFetchQueryCollectionViaQueryValue = false;
			_alreadyFetchedQueryCollectionViaQueryValue = false;
			_attributeType = null;
			_attributeTypeReturnsNewIfNotFound = true;
			_alwaysFetchAttributeType = false;
			_alreadyFetchedAttributeType = false;
			_context = null;
			_contextReturnsNewIfNotFound = true;
			_alwaysFetchContext = false;
			_alreadyFetchedContext = false;


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

			_fieldsCustomProperties.Add("AttributeTypeId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Name", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("ContextId", fieldHashtable);
		}
		#endregion


		/// <summary> Removes the sync logic for member _attributeType</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncAttributeType(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _attributeType, new PropertyChangedEventHandler( OnAttributeTypePropertyChanged ), "AttributeType", AttributeEntity.Relations.AttributeTypeEntityUsingAttributeTypeId, true, signalRelatedEntity, "Attribute", resetFKFields, new int[] { (int)AttributeFieldIndex.AttributeTypeId } );		
			_attributeType = null;
		}
		
		/// <summary> setups the sync logic for member _attributeType</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncAttributeType(IEntity relatedEntity)
		{
			if(_attributeType!=relatedEntity)
			{		
				DesetupSyncAttributeType(true, true);
				_attributeType = (AttributeTypeEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _attributeType, new PropertyChangedEventHandler( OnAttributeTypePropertyChanged ), "AttributeType", AttributeEntity.Relations.AttributeTypeEntityUsingAttributeTypeId, true, ref _alreadyFetchedAttributeType, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnAttributeTypePropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}

		/// <summary> Removes the sync logic for member _context</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncContext(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _context, new PropertyChangedEventHandler( OnContextPropertyChanged ), "Context", AttributeEntity.Relations.ContextEntityUsingContextId, true, signalRelatedEntity, "Attribute", resetFKFields, new int[] { (int)AttributeFieldIndex.ContextId } );		
			_context = null;
		}
		
		/// <summary> setups the sync logic for member _context</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncContext(IEntity relatedEntity)
		{
			if(_context!=relatedEntity)
			{		
				DesetupSyncContext(true, true);
				_context = (ContextEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _context, new PropertyChangedEventHandler( OnContextPropertyChanged ), "Context", AttributeEntity.Relations.ContextEntityUsingContextId, true, ref _alreadyFetchedContext, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnContextPropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}


		/// <summary> Fetches the entity from the persistent storage. Fetch simply reads the entity into an EntityFields object. </summary>
		/// <param name="id">PK value for Attribute which data should be fetched into this Attribute object</param>
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
				base.Fields[(int)AttributeFieldIndex.Id].ForcedCurrentValueWrite(id);
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
			return DAOFactory.CreateAttributeDAO();
		}
		
		/// <summary> Creates the entity factory for this type.</summary>
		/// <returns></returns>
		protected override IEntityFactory CreateEntityFactory()
		{
			return new AttributeEntityFactory();
		}

		#region Class Property Declarations
		/// <summary> The relations object holding all relations of this entity with other entity classes.</summary>
		public  static AttributeRelations Relations
		{
			get	{ return new AttributeRelations(); }
		}
		
		/// <summary> The custom properties for this entity type.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		public  static Dictionary<string, string> CustomProperties
		{
			get { return _customProperties;}
		}


		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'AttributeValue' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathAttributeValue
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.AttributeValueCollection(),
					(IEntityRelation)GetRelationsForField("AttributeValue")[0], (int)policyDB.EntityType.AttributeEntity, (int)policyDB.EntityType.AttributeValueEntity, 0, null, null, null, "AttributeValue", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'DecisionNode' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathDecisionNode
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.DecisionNodeCollection(),
					(IEntityRelation)GetRelationsForField("DecisionNode")[0], (int)policyDB.EntityType.AttributeEntity, (int)policyDB.EntityType.DecisionNodeEntity, 0, null, null, null, "DecisionNode", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'QueryValue' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathQueryValue
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.QueryValueCollection(),
					(IEntityRelation)GetRelationsForField("QueryValue")[0], (int)policyDB.EntityType.AttributeEntity, (int)policyDB.EntityType.QueryValueEntity, 0, null, null, null, "QueryValue", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'DecisionNode' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathDecisionNodeCollectionViaDecisionNode
		{
			get
			{
				IEntityRelation intermediateRelation = AttributeEntity.Relations.DecisionNodeEntityUsingAttributeId;
				intermediateRelation.SetAliases(string.Empty, "DecisionNode_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.DecisionNodeCollection(), intermediateRelation,
					(int)policyDB.EntityType.AttributeEntity, (int)policyDB.EntityType.DecisionNodeEntity, 0, null, null, GetRelationsForField("DecisionNodeCollectionViaDecisionNode"), "DecisionNodeCollectionViaDecisionNode", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'DecisionNode' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathDecisionNodeCollectionViaAttributeValue
		{
			get
			{
				IEntityRelation intermediateRelation = AttributeEntity.Relations.AttributeValueEntityUsingAttributeId;
				intermediateRelation.SetAliases(string.Empty, "AttributeValue_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.DecisionNodeCollection(), intermediateRelation,
					(int)policyDB.EntityType.AttributeEntity, (int)policyDB.EntityType.DecisionNodeEntity, 0, null, null, GetRelationsForField("DecisionNodeCollectionViaAttributeValue"), "DecisionNodeCollectionViaAttributeValue", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Query' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathQueryCollectionViaQueryValue
		{
			get
			{
				IEntityRelation intermediateRelation = AttributeEntity.Relations.QueryValueEntityUsingAttributeId;
				intermediateRelation.SetAliases(string.Empty, "QueryValue_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.QueryCollection(), intermediateRelation,
					(int)policyDB.EntityType.AttributeEntity, (int)policyDB.EntityType.QueryEntity, 0, null, null, GetRelationsForField("QueryCollectionViaQueryValue"), "QueryCollectionViaQueryValue", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'AttributeType' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathAttributeType
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.AttributeTypeCollection(),
					(IEntityRelation)GetRelationsForField("AttributeType")[0], (int)policyDB.EntityType.AttributeEntity, (int)policyDB.EntityType.AttributeTypeEntity, 0, null, null, null, "AttributeType", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Context' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathContext
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.ContextCollection(),
					(IEntityRelation)GetRelationsForField("Context")[0], (int)policyDB.EntityType.AttributeEntity, (int)policyDB.EntityType.ContextEntity, 0, null, null, null, "Context", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}


		/// <summary>Returns the full name for this entity, which is important for the DAO to find back persistence info for this entity.</summary>
		[Browsable(false), XmlIgnore]
		public override string LLBLGenProEntityName
		{
			get { return "AttributeEntity";}
		}

		/// <summary> The custom properties for the type of this entity instance.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		[Browsable(false), XmlIgnore]
		public override Dictionary<string, string> CustomPropertiesOfType
		{
			get { return AttributeEntity.CustomProperties;}
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
			get { return AttributeEntity.FieldsCustomProperties;}
		}

		/// <summary> The Id property of the Entity Attribute<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "attribute"."id"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, true, true</remarks>
		public virtual System.Int32 Id
		{
			get { return (System.Int32)GetValue((int)AttributeFieldIndex.Id, true); }
			set	{ SetValue((int)AttributeFieldIndex.Id, value, true); }
		}
		/// <summary> The AttributeTypeId property of the Entity Attribute<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "attribute"."attributeTypeId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 AttributeTypeId
		{
			get { return (System.Int32)GetValue((int)AttributeFieldIndex.AttributeTypeId, true); }
			set	{ SetValue((int)AttributeFieldIndex.AttributeTypeId, value, true); }
		}
		/// <summary> The Name property of the Entity Attribute<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "attribute"."name"<br/>
		/// Table field type characteristics (type, precision, scale, length): NVarChar, 0, 0, 250<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.String Name
		{
			get { return (System.String)GetValue((int)AttributeFieldIndex.Name, true); }
			set	{ SetValue((int)AttributeFieldIndex.Name, value, true); }
		}
		/// <summary> The ContextId property of the Entity Attribute<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "attribute"."contextId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 ContextId
		{
			get { return (System.Int32)GetValue((int)AttributeFieldIndex.ContextId, true); }
			set	{ SetValue((int)AttributeFieldIndex.ContextId, value, true); }
		}

		/// <summary> Retrieves all related entities of type 'AttributeValueEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiAttributeValue()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.AttributeValueCollection AttributeValue
		{
			get	{ return GetMultiAttributeValue(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for AttributeValue. When set to true, AttributeValue is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time AttributeValue is accessed. You can always execute
		/// a forced fetch by calling GetMultiAttributeValue(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchAttributeValue
		{
			get	{ return _alwaysFetchAttributeValue; }
			set	{ _alwaysFetchAttributeValue = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property AttributeValue already has been fetched. Setting this property to false when AttributeValue has been fetched
		/// will clear the AttributeValue collection well. Setting this property to true while AttributeValue hasn't been fetched disables lazy loading for AttributeValue</summary>
		[Browsable(false)]
		public bool AlreadyFetchedAttributeValue
		{
			get { return _alreadyFetchedAttributeValue;}
			set 
			{
				if(_alreadyFetchedAttributeValue && !value && (_attributeValue != null))
				{
					_attributeValue.Clear();
				}
				_alreadyFetchedAttributeValue = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiDecisionNode()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.DecisionNodeCollection DecisionNode
		{
			get	{ return GetMultiDecisionNode(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for DecisionNode. When set to true, DecisionNode is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time DecisionNode is accessed. You can always execute
		/// a forced fetch by calling GetMultiDecisionNode(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchDecisionNode
		{
			get	{ return _alwaysFetchDecisionNode; }
			set	{ _alwaysFetchDecisionNode = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property DecisionNode already has been fetched. Setting this property to false when DecisionNode has been fetched
		/// will clear the DecisionNode collection well. Setting this property to true while DecisionNode hasn't been fetched disables lazy loading for DecisionNode</summary>
		[Browsable(false)]
		public bool AlreadyFetchedDecisionNode
		{
			get { return _alreadyFetchedDecisionNode;}
			set 
			{
				if(_alreadyFetchedDecisionNode && !value && (_decisionNode != null))
				{
					_decisionNode.Clear();
				}
				_alreadyFetchedDecisionNode = value;
			}
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

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiDecisionNodeCollectionViaDecisionNode()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.DecisionNodeCollection DecisionNodeCollectionViaDecisionNode
		{
			get { return GetMultiDecisionNodeCollectionViaDecisionNode(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for DecisionNodeCollectionViaDecisionNode. When set to true, DecisionNodeCollectionViaDecisionNode is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time DecisionNodeCollectionViaDecisionNode is accessed. You can always execute
		/// a forced fetch by calling GetMultiDecisionNodeCollectionViaDecisionNode(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchDecisionNodeCollectionViaDecisionNode
		{
			get	{ return _alwaysFetchDecisionNodeCollectionViaDecisionNode; }
			set	{ _alwaysFetchDecisionNodeCollectionViaDecisionNode = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property DecisionNodeCollectionViaDecisionNode already has been fetched. Setting this property to false when DecisionNodeCollectionViaDecisionNode has been fetched
		/// will clear the DecisionNodeCollectionViaDecisionNode collection well. Setting this property to true while DecisionNodeCollectionViaDecisionNode hasn't been fetched disables lazy loading for DecisionNodeCollectionViaDecisionNode</summary>
		[Browsable(false)]
		public bool AlreadyFetchedDecisionNodeCollectionViaDecisionNode
		{
			get { return _alreadyFetchedDecisionNodeCollectionViaDecisionNode;}
			set 
			{
				if(_alreadyFetchedDecisionNodeCollectionViaDecisionNode && !value && (_decisionNodeCollectionViaDecisionNode != null))
				{
					_decisionNodeCollectionViaDecisionNode.Clear();
				}
				_alreadyFetchedDecisionNodeCollectionViaDecisionNode = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiDecisionNodeCollectionViaAttributeValue()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.DecisionNodeCollection DecisionNodeCollectionViaAttributeValue
		{
			get { return GetMultiDecisionNodeCollectionViaAttributeValue(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for DecisionNodeCollectionViaAttributeValue. When set to true, DecisionNodeCollectionViaAttributeValue is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time DecisionNodeCollectionViaAttributeValue is accessed. You can always execute
		/// a forced fetch by calling GetMultiDecisionNodeCollectionViaAttributeValue(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchDecisionNodeCollectionViaAttributeValue
		{
			get	{ return _alwaysFetchDecisionNodeCollectionViaAttributeValue; }
			set	{ _alwaysFetchDecisionNodeCollectionViaAttributeValue = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property DecisionNodeCollectionViaAttributeValue already has been fetched. Setting this property to false when DecisionNodeCollectionViaAttributeValue has been fetched
		/// will clear the DecisionNodeCollectionViaAttributeValue collection well. Setting this property to true while DecisionNodeCollectionViaAttributeValue hasn't been fetched disables lazy loading for DecisionNodeCollectionViaAttributeValue</summary>
		[Browsable(false)]
		public bool AlreadyFetchedDecisionNodeCollectionViaAttributeValue
		{
			get { return _alreadyFetchedDecisionNodeCollectionViaAttributeValue;}
			set 
			{
				if(_alreadyFetchedDecisionNodeCollectionViaAttributeValue && !value && (_decisionNodeCollectionViaAttributeValue != null))
				{
					_decisionNodeCollectionViaAttributeValue.Clear();
				}
				_alreadyFetchedDecisionNodeCollectionViaAttributeValue = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'QueryEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiQueryCollectionViaQueryValue()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.QueryCollection QueryCollectionViaQueryValue
		{
			get { return GetMultiQueryCollectionViaQueryValue(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for QueryCollectionViaQueryValue. When set to true, QueryCollectionViaQueryValue is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time QueryCollectionViaQueryValue is accessed. You can always execute
		/// a forced fetch by calling GetMultiQueryCollectionViaQueryValue(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchQueryCollectionViaQueryValue
		{
			get	{ return _alwaysFetchQueryCollectionViaQueryValue; }
			set	{ _alwaysFetchQueryCollectionViaQueryValue = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property QueryCollectionViaQueryValue already has been fetched. Setting this property to false when QueryCollectionViaQueryValue has been fetched
		/// will clear the QueryCollectionViaQueryValue collection well. Setting this property to true while QueryCollectionViaQueryValue hasn't been fetched disables lazy loading for QueryCollectionViaQueryValue</summary>
		[Browsable(false)]
		public bool AlreadyFetchedQueryCollectionViaQueryValue
		{
			get { return _alreadyFetchedQueryCollectionViaQueryValue;}
			set 
			{
				if(_alreadyFetchedQueryCollectionViaQueryValue && !value && (_queryCollectionViaQueryValue != null))
				{
					_queryCollectionViaQueryValue.Clear();
				}
				_alreadyFetchedQueryCollectionViaQueryValue = value;
			}
		}

		/// <summary> Gets / sets related entity of type 'AttributeTypeEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleAttributeType()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual AttributeTypeEntity AttributeType
		{
			get	{ return GetSingleAttributeType(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncAttributeType(value);
				}
				else
				{
					if(value==null)
					{
						if(_attributeType != null)
						{
							_attributeType.UnsetRelatedEntity(this, "Attribute");
						}
					}
					else
					{
						if(_attributeType!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "Attribute");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for AttributeType. When set to true, AttributeType is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time AttributeType is accessed. You can always execute
		/// a forced fetch by calling GetSingleAttributeType(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchAttributeType
		{
			get	{ return _alwaysFetchAttributeType; }
			set	{ _alwaysFetchAttributeType = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property AttributeType already has been fetched. Setting this property to false when AttributeType has been fetched
		/// will set AttributeType to null as well. Setting this property to true while AttributeType hasn't been fetched disables lazy loading for AttributeType</summary>
		[Browsable(false)]
		public bool AlreadyFetchedAttributeType
		{
			get { return _alreadyFetchedAttributeType;}
			set 
			{
				if(_alreadyFetchedAttributeType && !value)
				{
					this.AttributeType = null;
				}
				_alreadyFetchedAttributeType = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property AttributeType is not found
		/// in the database. When set to true, AttributeType will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool AttributeTypeReturnsNewIfNotFound
		{
			get	{ return _attributeTypeReturnsNewIfNotFound; }
			set { _attributeTypeReturnsNewIfNotFound = value; }	
		}
		/// <summary> Gets / sets related entity of type 'ContextEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleContext()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual ContextEntity Context
		{
			get	{ return GetSingleContext(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncContext(value);
				}
				else
				{
					if(value==null)
					{
						if(_context != null)
						{
							_context.UnsetRelatedEntity(this, "Attribute");
						}
					}
					else
					{
						if(_context!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "Attribute");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for Context. When set to true, Context is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Context is accessed. You can always execute
		/// a forced fetch by calling GetSingleContext(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchContext
		{
			get	{ return _alwaysFetchContext; }
			set	{ _alwaysFetchContext = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property Context already has been fetched. Setting this property to false when Context has been fetched
		/// will set Context to null as well. Setting this property to true while Context hasn't been fetched disables lazy loading for Context</summary>
		[Browsable(false)]
		public bool AlreadyFetchedContext
		{
			get { return _alreadyFetchedContext;}
			set 
			{
				if(_alreadyFetchedContext && !value)
				{
					this.Context = null;
				}
				_alreadyFetchedContext = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property Context is not found
		/// in the database. When set to true, Context will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool ContextReturnsNewIfNotFound
		{
			get	{ return _contextReturnsNewIfNotFound; }
			set { _contextReturnsNewIfNotFound = value; }	
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
			get { return (int)policyDB.EntityType.AttributeEntity; }
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
