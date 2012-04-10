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
	/// Entity class which represents the entity 'Rule'. <br/><br/>
	/// 
	/// </summary>
	[Serializable]
	public partial class RuleEntity : CommonEntityBase, ISerializable
		// __LLBLGENPRO_USER_CODE_REGION_START AdditionalInterfaces
		// __LLBLGENPRO_USER_CODE_REGION_END	
	{
		#region Class Member Declarations


		private DecisionNodeEntity _condition;
		private bool	_alwaysFetchCondition, _alreadyFetchedCondition, _conditionReturnsNewIfNotFound;
		private EffectEntity _effect;
		private bool	_alwaysFetchEffect, _alreadyFetchedEffect, _effectReturnsNewIfNotFound;
		private PolicyEntity _policy;
		private bool	_alwaysFetchPolicy, _alreadyFetchedPolicy, _policyReturnsNewIfNotFound;

		
		// __LLBLGENPRO_USER_CODE_REGION_START PrivateMembers
		// __LLBLGENPRO_USER_CODE_REGION_END
		#endregion

		#region Statics
		private static Dictionary<string, string>	_customProperties;
		private static Dictionary<string, Dictionary<string, string>>	_fieldsCustomProperties;

		/// <summary>All names of fields mapped onto a relation. Usable for in-memory filtering</summary>
		public static class MemberNames
		{
			/// <summary>Member name Condition</summary>
			public static readonly string Condition = "Condition";
			/// <summary>Member name Effect</summary>
			public static readonly string Effect = "Effect";
			/// <summary>Member name Policy</summary>
			public static readonly string Policy = "Policy";



		}
		#endregion
		
		/// <summary>Static CTor for setting up custom property hashtables. Is executed before the first instance of this entity class or derived classes is constructed. </summary>
		static RuleEntity()
		{
			SetupCustomPropertyHashtables();
		}

		/// <summary>CTor</summary>
		public RuleEntity()
		{
			InitClassEmpty(null);
		}


		/// <summary>CTor</summary>
		/// <param name="id">PK value for Rule which data should be fetched into this Rule object</param>
		public RuleEntity(System.Int32 id)
		{
			InitClassFetch(id, null, null);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for Rule which data should be fetched into this Rule object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		public RuleEntity(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			InitClassFetch(id, null, prefetchPathToUse);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for Rule which data should be fetched into this Rule object</param>
		/// <param name="validator">The custom validator object for this RuleEntity</param>
		public RuleEntity(System.Int32 id, IValidator validator)
		{
			InitClassFetch(id, validator, null);
		}


		/// <summary>Private CTor for deserialization</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		protected RuleEntity(SerializationInfo info, StreamingContext context) : base(info, context)
		{


			_condition = (DecisionNodeEntity)info.GetValue("_condition", typeof(DecisionNodeEntity));
			if(_condition!=null)
			{
				_condition.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_conditionReturnsNewIfNotFound = info.GetBoolean("_conditionReturnsNewIfNotFound");
			_alwaysFetchCondition = info.GetBoolean("_alwaysFetchCondition");
			_alreadyFetchedCondition = info.GetBoolean("_alreadyFetchedCondition");
			_effect = (EffectEntity)info.GetValue("_effect", typeof(EffectEntity));
			if(_effect!=null)
			{
				_effect.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_effectReturnsNewIfNotFound = info.GetBoolean("_effectReturnsNewIfNotFound");
			_alwaysFetchEffect = info.GetBoolean("_alwaysFetchEffect");
			_alreadyFetchedEffect = info.GetBoolean("_alreadyFetchedEffect");
			_policy = (PolicyEntity)info.GetValue("_policy", typeof(PolicyEntity));
			if(_policy!=null)
			{
				_policy.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_policyReturnsNewIfNotFound = info.GetBoolean("_policyReturnsNewIfNotFound");
			_alwaysFetchPolicy = info.GetBoolean("_alwaysFetchPolicy");
			_alreadyFetchedPolicy = info.GetBoolean("_alreadyFetchedPolicy");

			base.FixupDeserialization(FieldInfoProviderSingleton.GetInstance(), PersistenceInfoProviderSingleton.GetInstance());
			
			// __LLBLGENPRO_USER_CODE_REGION_START DeserializationConstructor
			// __LLBLGENPRO_USER_CODE_REGION_END
		}

		
		/// <summary>Performs the desync setup when an FK field has been changed. The entity referenced based on the FK field will be dereferenced and sync info will be removed.</summary>
		/// <param name="fieldIndex">The fieldindex.</param>
		protected override void PerformDesyncSetupFKFieldChange(int fieldIndex)
		{
			switch((RuleFieldIndex)fieldIndex)
			{
				case RuleFieldIndex.PolicyId:
					DesetupSyncPolicy(true, false);
					_alreadyFetchedPolicy = false;
					break;
				case RuleFieldIndex.EffectId:
					DesetupSyncEffect(true, false);
					_alreadyFetchedEffect = false;
					break;
				case RuleFieldIndex.ConditionId:
					DesetupSyncCondition(true, false);
					_alreadyFetchedCondition = false;
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


			_alreadyFetchedCondition = (_condition != null);
			_alreadyFetchedEffect = (_effect != null);
			_alreadyFetchedPolicy = (_policy != null);

		}
				
		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public override RelationCollection GetRelationsForFieldOfType(string fieldName)
		{
			return RuleEntity.GetRelationsForField(fieldName);
		}

		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public static RelationCollection GetRelationsForField(string fieldName)
		{
			RelationCollection toReturn = new RelationCollection();
			switch(fieldName)
			{
				case "Condition":
					toReturn.Add(RuleEntity.Relations.DecisionNodeEntityUsingConditionId);
					break;
				case "Effect":
					toReturn.Add(RuleEntity.Relations.EffectEntityUsingEffectId);
					break;
				case "Policy":
					toReturn.Add(RuleEntity.Relations.PolicyEntityUsingPolicyId);
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


			info.AddValue("_condition", (!this.MarkedForDeletion?_condition:null));
			info.AddValue("_conditionReturnsNewIfNotFound", _conditionReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchCondition", _alwaysFetchCondition);
			info.AddValue("_alreadyFetchedCondition", _alreadyFetchedCondition);
			info.AddValue("_effect", (!this.MarkedForDeletion?_effect:null));
			info.AddValue("_effectReturnsNewIfNotFound", _effectReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchEffect", _alwaysFetchEffect);
			info.AddValue("_alreadyFetchedEffect", _alreadyFetchedEffect);
			info.AddValue("_policy", (!this.MarkedForDeletion?_policy:null));
			info.AddValue("_policyReturnsNewIfNotFound", _policyReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchPolicy", _alwaysFetchPolicy);
			info.AddValue("_alreadyFetchedPolicy", _alreadyFetchedPolicy);

			
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
				case "Condition":
					_alreadyFetchedCondition = true;
					this.Condition = (DecisionNodeEntity)entity;
					break;
				case "Effect":
					_alreadyFetchedEffect = true;
					this.Effect = (EffectEntity)entity;
					break;
				case "Policy":
					_alreadyFetchedPolicy = true;
					this.Policy = (PolicyEntity)entity;
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
				case "Condition":
					SetupSyncCondition(relatedEntity);
					break;
				case "Effect":
					SetupSyncEffect(relatedEntity);
					break;
				case "Policy":
					SetupSyncPolicy(relatedEntity);
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
				case "Condition":
					DesetupSyncCondition(false, true);
					break;
				case "Effect":
					DesetupSyncEffect(false, true);
					break;
				case "Policy":
					DesetupSyncPolicy(false, true);
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
			if(_condition!=null)
			{
				toReturn.Add(_condition);
			}
			if(_effect!=null)
			{
				toReturn.Add(_effect);
			}
			if(_policy!=null)
			{
				toReturn.Add(_policy);
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
		/// <param name="id">PK value for Rule which data should be fetched into this Rule object</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id)
		{
			return FetchUsingPK(id, null, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Rule which data should be fetched into this Rule object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			return FetchUsingPK(id, prefetchPathToUse, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Rule which data should be fetched into this Rule object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse)
		{
			return Fetch(id, prefetchPathToUse, contextToUse, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Rule which data should be fetched into this Rule object</param>
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
		public bool TestOriginalFieldValueForNull(RuleFieldIndex fieldIndex)
		{
			return base.Fields[(int)fieldIndex].IsNull;
		}
		
		/// <summary>Returns true if the current value for the field with the fieldIndex passed in represents null/not defined, false otherwise.
		/// Should not be used for testing if the original value (read from the db) is NULL</summary>
		/// <param name="fieldIndex">Index of the field to test if its currentvalue is null/undefined</param>
		/// <returns>true if the field's value isn't defined yet, false otherwise</returns>
		public bool TestCurrentFieldValueForNull(RuleFieldIndex fieldIndex)
		{
			return base.CheckIfCurrentFieldValueIsNull((int)fieldIndex);
		}

				
		/// <summary>Gets a list of all the EntityRelation objects the type of this instance has.</summary>
		/// <returns>A list of all the EntityRelation objects the type of this instance has. Hierarchy relations are excluded.</returns>
		public override List<IEntityRelation> GetAllRelations()
		{
			return new RuleRelations().GetAllRelations();
		}




		/// <summary> Retrieves the related entity of type 'DecisionNodeEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'DecisionNodeEntity' which is related to this entity.</returns>
		public DecisionNodeEntity GetSingleCondition()
		{
			return GetSingleCondition(false);
		}

		/// <summary> Retrieves the related entity of type 'DecisionNodeEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'DecisionNodeEntity' which is related to this entity.</returns>
		public virtual DecisionNodeEntity GetSingleCondition(bool forceFetch)
		{
			if( ( !_alreadyFetchedCondition || forceFetch || _alwaysFetchCondition) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(RuleEntity.Relations.DecisionNodeEntityUsingConditionId);

				DecisionNodeEntity newEntity = new DecisionNodeEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.ConditionId.GetValueOrDefault());
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (DecisionNodeEntity)base.ActiveContext.Get(newEntity);
					}
					this.Condition = newEntity;
				}
				else
				{
					if(_conditionReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_condition == null)))
						{
							this.Condition = newEntity;
						}
					}
					else
					{
						this.Condition = null;
					}
				}
				_alreadyFetchedCondition = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _condition;
		}

		/// <summary> Retrieves the related entity of type 'EffectEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'EffectEntity' which is related to this entity.</returns>
		public EffectEntity GetSingleEffect()
		{
			return GetSingleEffect(false);
		}

		/// <summary> Retrieves the related entity of type 'EffectEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'EffectEntity' which is related to this entity.</returns>
		public virtual EffectEntity GetSingleEffect(bool forceFetch)
		{
			if( ( !_alreadyFetchedEffect || forceFetch || _alwaysFetchEffect) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(RuleEntity.Relations.EffectEntityUsingEffectId);

				EffectEntity newEntity = new EffectEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.EffectId);
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (EffectEntity)base.ActiveContext.Get(newEntity);
					}
					this.Effect = newEntity;
				}
				else
				{
					if(_effectReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_effect == null)))
						{
							this.Effect = newEntity;
						}
					}
					else
					{
						this.Effect = null;
					}
				}
				_alreadyFetchedEffect = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _effect;
		}

		/// <summary> Retrieves the related entity of type 'PolicyEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'PolicyEntity' which is related to this entity.</returns>
		public PolicyEntity GetSinglePolicy()
		{
			return GetSinglePolicy(false);
		}

		/// <summary> Retrieves the related entity of type 'PolicyEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'PolicyEntity' which is related to this entity.</returns>
		public virtual PolicyEntity GetSinglePolicy(bool forceFetch)
		{
			if( ( !_alreadyFetchedPolicy || forceFetch || _alwaysFetchPolicy) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(RuleEntity.Relations.PolicyEntityUsingPolicyId);

				PolicyEntity newEntity = new PolicyEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.PolicyId);
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (PolicyEntity)base.ActiveContext.Get(newEntity);
					}
					this.Policy = newEntity;
				}
				else
				{
					if(_policyReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_policy == null)))
						{
							this.Policy = newEntity;
						}
					}
					else
					{
						this.Policy = null;
					}
				}
				_alreadyFetchedPolicy = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _policy;
		}


		/// <summary> Performs the insert action of a new Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool InsertEntity()
		{
			RuleDAO dao = (RuleDAO)CreateDAOInstance();
			return dao.AddNew(base.Fields, base.Transaction);
		}
		
		/// <summary> Adds the internals to the active context. </summary>
		protected override void AddInternalsToContext()
		{


			if(_condition!=null)
			{
				_condition.ActiveContext = base.ActiveContext;
			}
			if(_effect!=null)
			{
				_effect.ActiveContext = base.ActiveContext;
			}
			if(_policy!=null)
			{
				_policy.ActiveContext = base.ActiveContext;
			}


		}


		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity()
		{
			RuleDAO dao = (RuleDAO)CreateDAOInstance();
			return dao.UpdateExisting(base.Fields, base.Transaction);
		}
		
		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <param name="updateRestriction">Predicate expression, meant for concurrency checks in an Update query</param>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity(IPredicate updateRestriction)
		{
			RuleDAO dao = (RuleDAO)CreateDAOInstance();
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
			return EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.RuleEntity);
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
			toReturn.Add("Condition", _condition);
			toReturn.Add("Effect", _effect);
			toReturn.Add("Policy", _policy);



			return toReturn;
		}
		

		/// <summary> Initializes the the entity and fetches the data related to the entity in this entity.</summary>
		/// <param name="id">PK value for Rule which data should be fetched into this Rule object</param>
		/// <param name="validator">The validator object for this RuleEntity</param>
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


			_condition = null;
			_conditionReturnsNewIfNotFound = true;
			_alwaysFetchCondition = false;
			_alreadyFetchedCondition = false;
			_effect = null;
			_effectReturnsNewIfNotFound = true;
			_alwaysFetchEffect = false;
			_alreadyFetchedEffect = false;
			_policy = null;
			_policyReturnsNewIfNotFound = true;
			_alwaysFetchPolicy = false;
			_alreadyFetchedPolicy = false;


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

			_fieldsCustomProperties.Add("PolicyId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("EffectId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("ConditionId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Order", fieldHashtable);
		}
		#endregion


		/// <summary> Removes the sync logic for member _condition</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncCondition(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _condition, new PropertyChangedEventHandler( OnConditionPropertyChanged ), "Condition", RuleEntity.Relations.DecisionNodeEntityUsingConditionId, true, signalRelatedEntity, "Rule", resetFKFields, new int[] { (int)RuleFieldIndex.ConditionId } );		
			_condition = null;
		}
		
		/// <summary> setups the sync logic for member _condition</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncCondition(IEntity relatedEntity)
		{
			if(_condition!=relatedEntity)
			{		
				DesetupSyncCondition(true, true);
				_condition = (DecisionNodeEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _condition, new PropertyChangedEventHandler( OnConditionPropertyChanged ), "Condition", RuleEntity.Relations.DecisionNodeEntityUsingConditionId, true, ref _alreadyFetchedCondition, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnConditionPropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}

		/// <summary> Removes the sync logic for member _effect</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncEffect(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _effect, new PropertyChangedEventHandler( OnEffectPropertyChanged ), "Effect", RuleEntity.Relations.EffectEntityUsingEffectId, true, signalRelatedEntity, "Rule", resetFKFields, new int[] { (int)RuleFieldIndex.EffectId } );		
			_effect = null;
		}
		
		/// <summary> setups the sync logic for member _effect</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncEffect(IEntity relatedEntity)
		{
			if(_effect!=relatedEntity)
			{		
				DesetupSyncEffect(true, true);
				_effect = (EffectEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _effect, new PropertyChangedEventHandler( OnEffectPropertyChanged ), "Effect", RuleEntity.Relations.EffectEntityUsingEffectId, true, ref _alreadyFetchedEffect, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnEffectPropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}

		/// <summary> Removes the sync logic for member _policy</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncPolicy(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _policy, new PropertyChangedEventHandler( OnPolicyPropertyChanged ), "Policy", RuleEntity.Relations.PolicyEntityUsingPolicyId, true, signalRelatedEntity, "Rule", resetFKFields, new int[] { (int)RuleFieldIndex.PolicyId } );		
			_policy = null;
		}
		
		/// <summary> setups the sync logic for member _policy</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncPolicy(IEntity relatedEntity)
		{
			if(_policy!=relatedEntity)
			{		
				DesetupSyncPolicy(true, true);
				_policy = (PolicyEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _policy, new PropertyChangedEventHandler( OnPolicyPropertyChanged ), "Policy", RuleEntity.Relations.PolicyEntityUsingPolicyId, true, ref _alreadyFetchedPolicy, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnPolicyPropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}


		/// <summary> Fetches the entity from the persistent storage. Fetch simply reads the entity into an EntityFields object. </summary>
		/// <param name="id">PK value for Rule which data should be fetched into this Rule object</param>
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
				base.Fields[(int)RuleFieldIndex.Id].ForcedCurrentValueWrite(id);
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
			return DAOFactory.CreateRuleDAO();
		}
		
		/// <summary> Creates the entity factory for this type.</summary>
		/// <returns></returns>
		protected override IEntityFactory CreateEntityFactory()
		{
			return new RuleEntityFactory();
		}

		#region Class Property Declarations
		/// <summary> The relations object holding all relations of this entity with other entity classes.</summary>
		public  static RuleRelations Relations
		{
			get	{ return new RuleRelations(); }
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
		public static IPrefetchPathElement PrefetchPathCondition
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.DecisionNodeCollection(),
					(IEntityRelation)GetRelationsForField("Condition")[0], (int)policyDB.EntityType.RuleEntity, (int)policyDB.EntityType.DecisionNodeEntity, 0, null, null, null, "Condition", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Effect' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathEffect
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.EffectCollection(),
					(IEntityRelation)GetRelationsForField("Effect")[0], (int)policyDB.EntityType.RuleEntity, (int)policyDB.EntityType.EffectEntity, 0, null, null, null, "Effect", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Policy' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathPolicy
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.PolicyCollection(),
					(IEntityRelation)GetRelationsForField("Policy")[0], (int)policyDB.EntityType.RuleEntity, (int)policyDB.EntityType.PolicyEntity, 0, null, null, null, "Policy", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}


		/// <summary>Returns the full name for this entity, which is important for the DAO to find back persistence info for this entity.</summary>
		[Browsable(false), XmlIgnore]
		public override string LLBLGenProEntityName
		{
			get { return "RuleEntity";}
		}

		/// <summary> The custom properties for the type of this entity instance.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		[Browsable(false), XmlIgnore]
		public override Dictionary<string, string> CustomPropertiesOfType
		{
			get { return RuleEntity.CustomProperties;}
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
			get { return RuleEntity.FieldsCustomProperties;}
		}

		/// <summary> The Id property of the Entity Rule<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "rule"."id"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, true, true</remarks>
		public virtual System.Int32 Id
		{
			get { return (System.Int32)GetValue((int)RuleFieldIndex.Id, true); }
			set	{ SetValue((int)RuleFieldIndex.Id, value, true); }
		}
		/// <summary> The PolicyId property of the Entity Rule<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "rule"."policyId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 PolicyId
		{
			get { return (System.Int32)GetValue((int)RuleFieldIndex.PolicyId, true); }
			set	{ SetValue((int)RuleFieldIndex.PolicyId, value, true); }
		}
		/// <summary> The EffectId property of the Entity Rule<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "rule"."effectId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 EffectId
		{
			get { return (System.Int32)GetValue((int)RuleFieldIndex.EffectId, true); }
			set	{ SetValue((int)RuleFieldIndex.EffectId, value, true); }
		}
		/// <summary> The ConditionId property of the Entity Rule<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "rule"."conditionId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): true, false, false</remarks>
		public virtual Nullable<System.Int32> ConditionId
		{
			get { return (Nullable<System.Int32>)GetValue((int)RuleFieldIndex.ConditionId, false); }
			set	{ SetValue((int)RuleFieldIndex.ConditionId, value, true); }
		}
		/// <summary> The Order property of the Entity Rule<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "rule"."order"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 Order
		{
			get { return (System.Int32)GetValue((int)RuleFieldIndex.Order, true); }
			set	{ SetValue((int)RuleFieldIndex.Order, value, true); }
		}



		/// <summary> Gets / sets related entity of type 'DecisionNodeEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleCondition()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual DecisionNodeEntity Condition
		{
			get	{ return GetSingleCondition(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncCondition(value);
				}
				else
				{
					if(value==null)
					{
						if(_condition != null)
						{
							_condition.UnsetRelatedEntity(this, "Rule");
						}
					}
					else
					{
						if(_condition!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "Rule");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for Condition. When set to true, Condition is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Condition is accessed. You can always execute
		/// a forced fetch by calling GetSingleCondition(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchCondition
		{
			get	{ return _alwaysFetchCondition; }
			set	{ _alwaysFetchCondition = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property Condition already has been fetched. Setting this property to false when Condition has been fetched
		/// will set Condition to null as well. Setting this property to true while Condition hasn't been fetched disables lazy loading for Condition</summary>
		[Browsable(false)]
		public bool AlreadyFetchedCondition
		{
			get { return _alreadyFetchedCondition;}
			set 
			{
				if(_alreadyFetchedCondition && !value)
				{
					this.Condition = null;
				}
				_alreadyFetchedCondition = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property Condition is not found
		/// in the database. When set to true, Condition will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool ConditionReturnsNewIfNotFound
		{
			get	{ return _conditionReturnsNewIfNotFound; }
			set { _conditionReturnsNewIfNotFound = value; }	
		}
		/// <summary> Gets / sets related entity of type 'EffectEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleEffect()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual EffectEntity Effect
		{
			get	{ return GetSingleEffect(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncEffect(value);
				}
				else
				{
					if(value==null)
					{
						if(_effect != null)
						{
							_effect.UnsetRelatedEntity(this, "Rule");
						}
					}
					else
					{
						if(_effect!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "Rule");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for Effect. When set to true, Effect is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Effect is accessed. You can always execute
		/// a forced fetch by calling GetSingleEffect(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchEffect
		{
			get	{ return _alwaysFetchEffect; }
			set	{ _alwaysFetchEffect = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property Effect already has been fetched. Setting this property to false when Effect has been fetched
		/// will set Effect to null as well. Setting this property to true while Effect hasn't been fetched disables lazy loading for Effect</summary>
		[Browsable(false)]
		public bool AlreadyFetchedEffect
		{
			get { return _alreadyFetchedEffect;}
			set 
			{
				if(_alreadyFetchedEffect && !value)
				{
					this.Effect = null;
				}
				_alreadyFetchedEffect = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property Effect is not found
		/// in the database. When set to true, Effect will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool EffectReturnsNewIfNotFound
		{
			get	{ return _effectReturnsNewIfNotFound; }
			set { _effectReturnsNewIfNotFound = value; }	
		}
		/// <summary> Gets / sets related entity of type 'PolicyEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSinglePolicy()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual PolicyEntity Policy
		{
			get	{ return GetSinglePolicy(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncPolicy(value);
				}
				else
				{
					if(value==null)
					{
						if(_policy != null)
						{
							_policy.UnsetRelatedEntity(this, "Rule");
						}
					}
					else
					{
						if(_policy!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "Rule");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for Policy. When set to true, Policy is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Policy is accessed. You can always execute
		/// a forced fetch by calling GetSinglePolicy(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchPolicy
		{
			get	{ return _alwaysFetchPolicy; }
			set	{ _alwaysFetchPolicy = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property Policy already has been fetched. Setting this property to false when Policy has been fetched
		/// will set Policy to null as well. Setting this property to true while Policy hasn't been fetched disables lazy loading for Policy</summary>
		[Browsable(false)]
		public bool AlreadyFetchedPolicy
		{
			get { return _alreadyFetchedPolicy;}
			set 
			{
				if(_alreadyFetchedPolicy && !value)
				{
					this.Policy = null;
				}
				_alreadyFetchedPolicy = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property Policy is not found
		/// in the database. When set to true, Policy will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool PolicyReturnsNewIfNotFound
		{
			get	{ return _policyReturnsNewIfNotFound; }
			set { _policyReturnsNewIfNotFound = value; }	
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
			get { return (int)policyDB.EntityType.RuleEntity; }
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
