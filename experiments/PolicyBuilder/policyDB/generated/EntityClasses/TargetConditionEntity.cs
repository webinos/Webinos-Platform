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
	/// Entity class which represents the entity 'TargetCondition'. <br/><br/>
	/// 
	/// </summary>
	[Serializable]
	public partial class TargetConditionEntity : CommonEntityBase, ISerializable
		// __LLBLGENPRO_USER_CODE_REGION_START AdditionalInterfaces
		// __LLBLGENPRO_USER_CODE_REGION_END	
	{
		#region Class Member Declarations


		private DecisionNodeEntity _decisionNode;
		private bool	_alwaysFetchDecisionNode, _alreadyFetchedDecisionNode, _decisionNodeReturnsNewIfNotFound;
		private TargetEntity _target;
		private bool	_alwaysFetchTarget, _alreadyFetchedTarget, _targetReturnsNewIfNotFound;

		
		// __LLBLGENPRO_USER_CODE_REGION_START PrivateMembers
		// __LLBLGENPRO_USER_CODE_REGION_END
		#endregion

		#region Statics
		private static Dictionary<string, string>	_customProperties;
		private static Dictionary<string, Dictionary<string, string>>	_fieldsCustomProperties;

		/// <summary>All names of fields mapped onto a relation. Usable for in-memory filtering</summary>
		public static class MemberNames
		{
			/// <summary>Member name DecisionNode</summary>
			public static readonly string DecisionNode = "DecisionNode";
			/// <summary>Member name Target</summary>
			public static readonly string Target = "Target";



		}
		#endregion
		
		/// <summary>Static CTor for setting up custom property hashtables. Is executed before the first instance of this entity class or derived classes is constructed. </summary>
		static TargetConditionEntity()
		{
			SetupCustomPropertyHashtables();
		}

		/// <summary>CTor</summary>
		public TargetConditionEntity()
		{
			InitClassEmpty(null);
		}


		/// <summary>CTor</summary>
		/// <param name="targetId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="conditionId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		public TargetConditionEntity(System.Int32 targetId, System.Int32 conditionId)
		{
			InitClassFetch(targetId, conditionId, null, null);
		}

		/// <summary>CTor</summary>
		/// <param name="targetId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="conditionId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		public TargetConditionEntity(System.Int32 targetId, System.Int32 conditionId, IPrefetchPath prefetchPathToUse)
		{
			InitClassFetch(targetId, conditionId, null, prefetchPathToUse);
		}

		/// <summary>CTor</summary>
		/// <param name="targetId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="conditionId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="validator">The custom validator object for this TargetConditionEntity</param>
		public TargetConditionEntity(System.Int32 targetId, System.Int32 conditionId, IValidator validator)
		{
			InitClassFetch(targetId, conditionId, validator, null);
		}


		/// <summary>Private CTor for deserialization</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		protected TargetConditionEntity(SerializationInfo info, StreamingContext context) : base(info, context)
		{


			_decisionNode = (DecisionNodeEntity)info.GetValue("_decisionNode", typeof(DecisionNodeEntity));
			if(_decisionNode!=null)
			{
				_decisionNode.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_decisionNodeReturnsNewIfNotFound = info.GetBoolean("_decisionNodeReturnsNewIfNotFound");
			_alwaysFetchDecisionNode = info.GetBoolean("_alwaysFetchDecisionNode");
			_alreadyFetchedDecisionNode = info.GetBoolean("_alreadyFetchedDecisionNode");
			_target = (TargetEntity)info.GetValue("_target", typeof(TargetEntity));
			if(_target!=null)
			{
				_target.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_targetReturnsNewIfNotFound = info.GetBoolean("_targetReturnsNewIfNotFound");
			_alwaysFetchTarget = info.GetBoolean("_alwaysFetchTarget");
			_alreadyFetchedTarget = info.GetBoolean("_alreadyFetchedTarget");

			base.FixupDeserialization(FieldInfoProviderSingleton.GetInstance(), PersistenceInfoProviderSingleton.GetInstance());
			
			// __LLBLGENPRO_USER_CODE_REGION_START DeserializationConstructor
			// __LLBLGENPRO_USER_CODE_REGION_END
		}

		
		/// <summary>Performs the desync setup when an FK field has been changed. The entity referenced based on the FK field will be dereferenced and sync info will be removed.</summary>
		/// <param name="fieldIndex">The fieldindex.</param>
		protected override void PerformDesyncSetupFKFieldChange(int fieldIndex)
		{
			switch((TargetConditionFieldIndex)fieldIndex)
			{
				case TargetConditionFieldIndex.TargetId:
					DesetupSyncTarget(true, false);
					_alreadyFetchedTarget = false;
					break;
				case TargetConditionFieldIndex.ConditionId:
					DesetupSyncDecisionNode(true, false);
					_alreadyFetchedDecisionNode = false;
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


			_alreadyFetchedDecisionNode = (_decisionNode != null);
			_alreadyFetchedTarget = (_target != null);

		}
				
		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public override RelationCollection GetRelationsForFieldOfType(string fieldName)
		{
			return TargetConditionEntity.GetRelationsForField(fieldName);
		}

		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public static RelationCollection GetRelationsForField(string fieldName)
		{
			RelationCollection toReturn = new RelationCollection();
			switch(fieldName)
			{
				case "DecisionNode":
					toReturn.Add(TargetConditionEntity.Relations.DecisionNodeEntityUsingConditionId);
					break;
				case "Target":
					toReturn.Add(TargetConditionEntity.Relations.TargetEntityUsingTargetId);
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


			info.AddValue("_decisionNode", (!this.MarkedForDeletion?_decisionNode:null));
			info.AddValue("_decisionNodeReturnsNewIfNotFound", _decisionNodeReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchDecisionNode", _alwaysFetchDecisionNode);
			info.AddValue("_alreadyFetchedDecisionNode", _alreadyFetchedDecisionNode);
			info.AddValue("_target", (!this.MarkedForDeletion?_target:null));
			info.AddValue("_targetReturnsNewIfNotFound", _targetReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchTarget", _alwaysFetchTarget);
			info.AddValue("_alreadyFetchedTarget", _alreadyFetchedTarget);

			
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
				case "DecisionNode":
					_alreadyFetchedDecisionNode = true;
					this.DecisionNode = (DecisionNodeEntity)entity;
					break;
				case "Target":
					_alreadyFetchedTarget = true;
					this.Target = (TargetEntity)entity;
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
				case "DecisionNode":
					SetupSyncDecisionNode(relatedEntity);
					break;
				case "Target":
					SetupSyncTarget(relatedEntity);
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
				case "DecisionNode":
					DesetupSyncDecisionNode(false, true);
					break;
				case "Target":
					DesetupSyncTarget(false, true);
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
			if(_decisionNode!=null)
			{
				toReturn.Add(_decisionNode);
			}
			if(_target!=null)
			{
				toReturn.Add(_target);
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
		/// <param name="targetId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="conditionId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 targetId, System.Int32 conditionId)
		{
			return FetchUsingPK(targetId, conditionId, null, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="targetId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="conditionId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 targetId, System.Int32 conditionId, IPrefetchPath prefetchPathToUse)
		{
			return FetchUsingPK(targetId, conditionId, prefetchPathToUse, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="targetId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="conditionId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 targetId, System.Int32 conditionId, IPrefetchPath prefetchPathToUse, Context contextToUse)
		{
			return Fetch(targetId, conditionId, prefetchPathToUse, contextToUse, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="targetId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="conditionId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <param name="excludedIncludedFields">The list of IEntityField objects which have to be excluded or included for the fetch. 
		/// If null or empty, all fields are fetched (default). If an instance of ExcludeIncludeFieldsList is passed in and its ExcludeContainedFields property
		/// is set to false, the fields contained in excludedIncludedFields are kept in the query, the rest of the fields in the query are excluded.</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 targetId, System.Int32 conditionId, IPrefetchPath prefetchPathToUse, Context contextToUse, ExcludeIncludeFieldsList excludedIncludedFields)
		{
			return Fetch(targetId, conditionId, prefetchPathToUse, contextToUse, excludedIncludedFields);
		}

		/// <summary> Refetches the Entity from the persistent storage. Refetch is used to re-load an Entity which is marked "Out-of-sync", due to a save action. 
		/// Refetching an empty Entity has no effect. </summary>
		/// <returns>true if Refetch succeeded, false otherwise</returns>
		public override bool Refetch()
		{
			return Fetch(this.TargetId, this.ConditionId, null, null, null);
		}

		/// <summary> Returns true if the original value for the field with the fieldIndex passed in, read from the persistent storage was NULL, false otherwise.
		/// Should not be used for testing if the current value is NULL, use <see cref="TestCurrentFieldValueForNull"/> for that.</summary>
		/// <param name="fieldIndex">Index of the field to test if that field was NULL in the persistent storage</param>
		/// <returns>true if the field with the passed in index was NULL in the persistent storage, false otherwise</returns>
		public bool TestOriginalFieldValueForNull(TargetConditionFieldIndex fieldIndex)
		{
			return base.Fields[(int)fieldIndex].IsNull;
		}
		
		/// <summary>Returns true if the current value for the field with the fieldIndex passed in represents null/not defined, false otherwise.
		/// Should not be used for testing if the original value (read from the db) is NULL</summary>
		/// <param name="fieldIndex">Index of the field to test if its currentvalue is null/undefined</param>
		/// <returns>true if the field's value isn't defined yet, false otherwise</returns>
		public bool TestCurrentFieldValueForNull(TargetConditionFieldIndex fieldIndex)
		{
			return base.CheckIfCurrentFieldValueIsNull((int)fieldIndex);
		}

				
		/// <summary>Gets a list of all the EntityRelation objects the type of this instance has.</summary>
		/// <returns>A list of all the EntityRelation objects the type of this instance has. Hierarchy relations are excluded.</returns>
		public override List<IEntityRelation> GetAllRelations()
		{
			return new TargetConditionRelations().GetAllRelations();
		}




		/// <summary> Retrieves the related entity of type 'DecisionNodeEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'DecisionNodeEntity' which is related to this entity.</returns>
		public DecisionNodeEntity GetSingleDecisionNode()
		{
			return GetSingleDecisionNode(false);
		}

		/// <summary> Retrieves the related entity of type 'DecisionNodeEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'DecisionNodeEntity' which is related to this entity.</returns>
		public virtual DecisionNodeEntity GetSingleDecisionNode(bool forceFetch)
		{
			if( ( !_alreadyFetchedDecisionNode || forceFetch || _alwaysFetchDecisionNode) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(TargetConditionEntity.Relations.DecisionNodeEntityUsingConditionId);

				DecisionNodeEntity newEntity = new DecisionNodeEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.ConditionId);
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (DecisionNodeEntity)base.ActiveContext.Get(newEntity);
					}
					this.DecisionNode = newEntity;
				}
				else
				{
					if(_decisionNodeReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_decisionNode == null)))
						{
							this.DecisionNode = newEntity;
						}
					}
					else
					{
						this.DecisionNode = null;
					}
				}
				_alreadyFetchedDecisionNode = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _decisionNode;
		}

		/// <summary> Retrieves the related entity of type 'TargetEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'TargetEntity' which is related to this entity.</returns>
		public TargetEntity GetSingleTarget()
		{
			return GetSingleTarget(false);
		}

		/// <summary> Retrieves the related entity of type 'TargetEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'TargetEntity' which is related to this entity.</returns>
		public virtual TargetEntity GetSingleTarget(bool forceFetch)
		{
			if( ( !_alreadyFetchedTarget || forceFetch || _alwaysFetchTarget) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(TargetConditionEntity.Relations.TargetEntityUsingTargetId);

				TargetEntity newEntity = new TargetEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.TargetId);
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (TargetEntity)base.ActiveContext.Get(newEntity);
					}
					this.Target = newEntity;
				}
				else
				{
					if(_targetReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_target == null)))
						{
							this.Target = newEntity;
						}
					}
					else
					{
						this.Target = null;
					}
				}
				_alreadyFetchedTarget = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _target;
		}


		/// <summary> Performs the insert action of a new Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool InsertEntity()
		{
			TargetConditionDAO dao = (TargetConditionDAO)CreateDAOInstance();
			return dao.AddNew(base.Fields, base.Transaction);
		}
		
		/// <summary> Adds the internals to the active context. </summary>
		protected override void AddInternalsToContext()
		{


			if(_decisionNode!=null)
			{
				_decisionNode.ActiveContext = base.ActiveContext;
			}
			if(_target!=null)
			{
				_target.ActiveContext = base.ActiveContext;
			}


		}


		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity()
		{
			TargetConditionDAO dao = (TargetConditionDAO)CreateDAOInstance();
			return dao.UpdateExisting(base.Fields, base.Transaction);
		}
		
		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <param name="updateRestriction">Predicate expression, meant for concurrency checks in an Update query</param>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity(IPredicate updateRestriction)
		{
			TargetConditionDAO dao = (TargetConditionDAO)CreateDAOInstance();
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
			return EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.TargetConditionEntity);
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
			toReturn.Add("DecisionNode", _decisionNode);
			toReturn.Add("Target", _target);



			return toReturn;
		}
		

		/// <summary> Initializes the the entity and fetches the data related to the entity in this entity.</summary>
		/// <param name="targetId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="conditionId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="validator">The validator object for this TargetConditionEntity</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		protected virtual void InitClassFetch(System.Int32 targetId, System.Int32 conditionId, IValidator validator, IPrefetchPath prefetchPathToUse)
		{
			OnInitializing();
			base.Validator = validator;
			InitClassMembers();
			base.Fields = CreateFields();
			bool wasSuccesful = Fetch(targetId, conditionId, prefetchPathToUse, null, null);
			base.IsNew = !wasSuccesful;

			
			// __LLBLGENPRO_USER_CODE_REGION_START InitClassFetch
			// __LLBLGENPRO_USER_CODE_REGION_END

			OnInitialized();
		}

		/// <summary> Initializes the class members</summary>
		private void InitClassMembers()
		{


			_decisionNode = null;
			_decisionNodeReturnsNewIfNotFound = true;
			_alwaysFetchDecisionNode = false;
			_alreadyFetchedDecisionNode = false;
			_target = null;
			_targetReturnsNewIfNotFound = true;
			_alwaysFetchTarget = false;
			_alreadyFetchedTarget = false;


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

			_fieldsCustomProperties.Add("TargetId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("ConditionId", fieldHashtable);
		}
		#endregion


		/// <summary> Removes the sync logic for member _decisionNode</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncDecisionNode(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _decisionNode, new PropertyChangedEventHandler( OnDecisionNodePropertyChanged ), "DecisionNode", TargetConditionEntity.Relations.DecisionNodeEntityUsingConditionId, true, signalRelatedEntity, "TargetCondition", resetFKFields, new int[] { (int)TargetConditionFieldIndex.ConditionId } );		
			_decisionNode = null;
		}
		
		/// <summary> setups the sync logic for member _decisionNode</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncDecisionNode(IEntity relatedEntity)
		{
			if(_decisionNode!=relatedEntity)
			{		
				DesetupSyncDecisionNode(true, true);
				_decisionNode = (DecisionNodeEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _decisionNode, new PropertyChangedEventHandler( OnDecisionNodePropertyChanged ), "DecisionNode", TargetConditionEntity.Relations.DecisionNodeEntityUsingConditionId, true, ref _alreadyFetchedDecisionNode, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnDecisionNodePropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}

		/// <summary> Removes the sync logic for member _target</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncTarget(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _target, new PropertyChangedEventHandler( OnTargetPropertyChanged ), "Target", TargetConditionEntity.Relations.TargetEntityUsingTargetId, true, signalRelatedEntity, "TargetCondition", resetFKFields, new int[] { (int)TargetConditionFieldIndex.TargetId } );		
			_target = null;
		}
		
		/// <summary> setups the sync logic for member _target</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncTarget(IEntity relatedEntity)
		{
			if(_target!=relatedEntity)
			{		
				DesetupSyncTarget(true, true);
				_target = (TargetEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _target, new PropertyChangedEventHandler( OnTargetPropertyChanged ), "Target", TargetConditionEntity.Relations.TargetEntityUsingTargetId, true, ref _alreadyFetchedTarget, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnTargetPropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}


		/// <summary> Fetches the entity from the persistent storage. Fetch simply reads the entity into an EntityFields object. </summary>
		/// <param name="targetId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="conditionId">PK value for TargetCondition which data should be fetched into this TargetCondition object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <param name="excludedIncludedFields">The list of IEntityField objects which have to be excluded or included for the fetch. 
		/// If null or empty, all fields are fetched (default). If an instance of ExcludeIncludeFieldsList is passed in and its ExcludeContainedFields property
		/// is set to false, the fields contained in excludedIncludedFields are kept in the query, the rest of the fields in the query are excluded.</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		private bool Fetch(System.Int32 targetId, System.Int32 conditionId, IPrefetchPath prefetchPathToUse, Context contextToUse, ExcludeIncludeFieldsList excludedIncludedFields)
		{
			try
			{
				OnFetch();
				IDao dao = this.CreateDAOInstance();
				base.Fields[(int)TargetConditionFieldIndex.TargetId].ForcedCurrentValueWrite(targetId);
				base.Fields[(int)TargetConditionFieldIndex.ConditionId].ForcedCurrentValueWrite(conditionId);
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
			return DAOFactory.CreateTargetConditionDAO();
		}
		
		/// <summary> Creates the entity factory for this type.</summary>
		/// <returns></returns>
		protected override IEntityFactory CreateEntityFactory()
		{
			return new TargetConditionEntityFactory();
		}

		#region Class Property Declarations
		/// <summary> The relations object holding all relations of this entity with other entity classes.</summary>
		public  static TargetConditionRelations Relations
		{
			get	{ return new TargetConditionRelations(); }
		}
		
		/// <summary> The custom properties for this entity type.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		public  static Dictionary<string, string> CustomProperties
		{
			get { return _customProperties;}
		}




		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'DecisionNode' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathDecisionNode
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.DecisionNodeCollection(),
					(IEntityRelation)GetRelationsForField("DecisionNode")[0], (int)policyDB.EntityType.TargetConditionEntity, (int)policyDB.EntityType.DecisionNodeEntity, 0, null, null, null, "DecisionNode", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Target' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathTarget
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.TargetCollection(),
					(IEntityRelation)GetRelationsForField("Target")[0], (int)policyDB.EntityType.TargetConditionEntity, (int)policyDB.EntityType.TargetEntity, 0, null, null, null, "Target", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}


		/// <summary>Returns the full name for this entity, which is important for the DAO to find back persistence info for this entity.</summary>
		[Browsable(false), XmlIgnore]
		public override string LLBLGenProEntityName
		{
			get { return "TargetConditionEntity";}
		}

		/// <summary> The custom properties for the type of this entity instance.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		[Browsable(false), XmlIgnore]
		public override Dictionary<string, string> CustomPropertiesOfType
		{
			get { return TargetConditionEntity.CustomProperties;}
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
			get { return TargetConditionEntity.FieldsCustomProperties;}
		}

		/// <summary> The TargetId property of the Entity TargetCondition<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "targetCondition"."targetId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, true, false</remarks>
		public virtual System.Int32 TargetId
		{
			get { return (System.Int32)GetValue((int)TargetConditionFieldIndex.TargetId, true); }
			set	{ SetValue((int)TargetConditionFieldIndex.TargetId, value, true); }
		}
		/// <summary> The ConditionId property of the Entity TargetCondition<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "targetCondition"."conditionId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, true, false</remarks>
		public virtual System.Int32 ConditionId
		{
			get { return (System.Int32)GetValue((int)TargetConditionFieldIndex.ConditionId, true); }
			set	{ SetValue((int)TargetConditionFieldIndex.ConditionId, value, true); }
		}



		/// <summary> Gets / sets related entity of type 'DecisionNodeEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleDecisionNode()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual DecisionNodeEntity DecisionNode
		{
			get	{ return GetSingleDecisionNode(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncDecisionNode(value);
				}
				else
				{
					if(value==null)
					{
						if(_decisionNode != null)
						{
							_decisionNode.UnsetRelatedEntity(this, "TargetCondition");
						}
					}
					else
					{
						if(_decisionNode!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "TargetCondition");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for DecisionNode. When set to true, DecisionNode is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time DecisionNode is accessed. You can always execute
		/// a forced fetch by calling GetSingleDecisionNode(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchDecisionNode
		{
			get	{ return _alwaysFetchDecisionNode; }
			set	{ _alwaysFetchDecisionNode = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property DecisionNode already has been fetched. Setting this property to false when DecisionNode has been fetched
		/// will set DecisionNode to null as well. Setting this property to true while DecisionNode hasn't been fetched disables lazy loading for DecisionNode</summary>
		[Browsable(false)]
		public bool AlreadyFetchedDecisionNode
		{
			get { return _alreadyFetchedDecisionNode;}
			set 
			{
				if(_alreadyFetchedDecisionNode && !value)
				{
					this.DecisionNode = null;
				}
				_alreadyFetchedDecisionNode = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property DecisionNode is not found
		/// in the database. When set to true, DecisionNode will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool DecisionNodeReturnsNewIfNotFound
		{
			get	{ return _decisionNodeReturnsNewIfNotFound; }
			set { _decisionNodeReturnsNewIfNotFound = value; }	
		}
		/// <summary> Gets / sets related entity of type 'TargetEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleTarget()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual TargetEntity Target
		{
			get	{ return GetSingleTarget(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncTarget(value);
				}
				else
				{
					if(value==null)
					{
						if(_target != null)
						{
							_target.UnsetRelatedEntity(this, "TargetCondition");
						}
					}
					else
					{
						if(_target!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "TargetCondition");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for Target. When set to true, Target is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Target is accessed. You can always execute
		/// a forced fetch by calling GetSingleTarget(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchTarget
		{
			get	{ return _alwaysFetchTarget; }
			set	{ _alwaysFetchTarget = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property Target already has been fetched. Setting this property to false when Target has been fetched
		/// will set Target to null as well. Setting this property to true while Target hasn't been fetched disables lazy loading for Target</summary>
		[Browsable(false)]
		public bool AlreadyFetchedTarget
		{
			get { return _alreadyFetchedTarget;}
			set 
			{
				if(_alreadyFetchedTarget && !value)
				{
					this.Target = null;
				}
				_alreadyFetchedTarget = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property Target is not found
		/// in the database. When set to true, Target will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool TargetReturnsNewIfNotFound
		{
			get	{ return _targetReturnsNewIfNotFound; }
			set { _targetReturnsNewIfNotFound = value; }	
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
			get { return (int)policyDB.EntityType.TargetConditionEntity; }
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
