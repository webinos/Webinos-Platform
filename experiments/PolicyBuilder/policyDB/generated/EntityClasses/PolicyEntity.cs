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
	/// Entity class which represents the entity 'Policy'. <br/><br/>
	/// 
	/// </summary>
	[Serializable]
	public partial class PolicyEntity : CommonEntityBase, ISerializable
		// __LLBLGENPRO_USER_CODE_REGION_START AdditionalInterfaces
		// __LLBLGENPRO_USER_CODE_REGION_END	
	{
		#region Class Member Declarations
		private policyDB.CollectionClasses.PolicyLinkCollection	_policyLink;
		private bool	_alwaysFetchPolicyLink, _alreadyFetchedPolicyLink;
		private policyDB.CollectionClasses.RuleCollection	_rule;
		private bool	_alwaysFetchRule, _alreadyFetchedRule;
		private policyDB.CollectionClasses.DecisionNodeCollection _decisionNodeCollectionViaRule;
		private bool	_alwaysFetchDecisionNodeCollectionViaRule, _alreadyFetchedDecisionNodeCollectionViaRule;
		private policyDB.CollectionClasses.EffectCollection _effectCollectionViaRule;
		private bool	_alwaysFetchEffectCollectionViaRule, _alreadyFetchedEffectCollectionViaRule;
		private policyDB.CollectionClasses.PolicyLinkCollection _policyLinkCollectionViaPolicyLink;
		private bool	_alwaysFetchPolicyLinkCollectionViaPolicyLink, _alreadyFetchedPolicyLinkCollectionViaPolicyLink;
		private CombineModeEntity _combineMode;
		private bool	_alwaysFetchCombineMode, _alreadyFetchedCombineMode, _combineModeReturnsNewIfNotFound;
		private LibraryEntity _library;
		private bool	_alwaysFetchLibrary, _alreadyFetchedLibrary, _libraryReturnsNewIfNotFound;
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
			/// <summary>Member name CombineMode</summary>
			public static readonly string CombineMode = "CombineMode";
			/// <summary>Member name Library</summary>
			public static readonly string Library = "Library";
			/// <summary>Member name Target</summary>
			public static readonly string Target = "Target";
			/// <summary>Member name PolicyLink</summary>
			public static readonly string PolicyLink = "PolicyLink";
			/// <summary>Member name Rule</summary>
			public static readonly string Rule = "Rule";
			/// <summary>Member name DecisionNodeCollectionViaRule</summary>
			public static readonly string DecisionNodeCollectionViaRule = "DecisionNodeCollectionViaRule";
			/// <summary>Member name EffectCollectionViaRule</summary>
			public static readonly string EffectCollectionViaRule = "EffectCollectionViaRule";
			/// <summary>Member name PolicyLinkCollectionViaPolicyLink</summary>
			public static readonly string PolicyLinkCollectionViaPolicyLink = "PolicyLinkCollectionViaPolicyLink";

		}
		#endregion
		
		/// <summary>Static CTor for setting up custom property hashtables. Is executed before the first instance of this entity class or derived classes is constructed. </summary>
		static PolicyEntity()
		{
			SetupCustomPropertyHashtables();
		}

		/// <summary>CTor</summary>
		public PolicyEntity()
		{
			InitClassEmpty(null);
		}


		/// <summary>CTor</summary>
		/// <param name="id">PK value for Policy which data should be fetched into this Policy object</param>
		public PolicyEntity(System.Int32 id)
		{
			InitClassFetch(id, null, null);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for Policy which data should be fetched into this Policy object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		public PolicyEntity(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			InitClassFetch(id, null, prefetchPathToUse);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for Policy which data should be fetched into this Policy object</param>
		/// <param name="validator">The custom validator object for this PolicyEntity</param>
		public PolicyEntity(System.Int32 id, IValidator validator)
		{
			InitClassFetch(id, validator, null);
		}


		/// <summary>Private CTor for deserialization</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		protected PolicyEntity(SerializationInfo info, StreamingContext context) : base(info, context)
		{
			_policyLink = (policyDB.CollectionClasses.PolicyLinkCollection)info.GetValue("_policyLink", typeof(policyDB.CollectionClasses.PolicyLinkCollection));
			_alwaysFetchPolicyLink = info.GetBoolean("_alwaysFetchPolicyLink");
			_alreadyFetchedPolicyLink = info.GetBoolean("_alreadyFetchedPolicyLink");
			_rule = (policyDB.CollectionClasses.RuleCollection)info.GetValue("_rule", typeof(policyDB.CollectionClasses.RuleCollection));
			_alwaysFetchRule = info.GetBoolean("_alwaysFetchRule");
			_alreadyFetchedRule = info.GetBoolean("_alreadyFetchedRule");
			_decisionNodeCollectionViaRule = (policyDB.CollectionClasses.DecisionNodeCollection)info.GetValue("_decisionNodeCollectionViaRule", typeof(policyDB.CollectionClasses.DecisionNodeCollection));
			_alwaysFetchDecisionNodeCollectionViaRule = info.GetBoolean("_alwaysFetchDecisionNodeCollectionViaRule");
			_alreadyFetchedDecisionNodeCollectionViaRule = info.GetBoolean("_alreadyFetchedDecisionNodeCollectionViaRule");
			_effectCollectionViaRule = (policyDB.CollectionClasses.EffectCollection)info.GetValue("_effectCollectionViaRule", typeof(policyDB.CollectionClasses.EffectCollection));
			_alwaysFetchEffectCollectionViaRule = info.GetBoolean("_alwaysFetchEffectCollectionViaRule");
			_alreadyFetchedEffectCollectionViaRule = info.GetBoolean("_alreadyFetchedEffectCollectionViaRule");
			_policyLinkCollectionViaPolicyLink = (policyDB.CollectionClasses.PolicyLinkCollection)info.GetValue("_policyLinkCollectionViaPolicyLink", typeof(policyDB.CollectionClasses.PolicyLinkCollection));
			_alwaysFetchPolicyLinkCollectionViaPolicyLink = info.GetBoolean("_alwaysFetchPolicyLinkCollectionViaPolicyLink");
			_alreadyFetchedPolicyLinkCollectionViaPolicyLink = info.GetBoolean("_alreadyFetchedPolicyLinkCollectionViaPolicyLink");
			_combineMode = (CombineModeEntity)info.GetValue("_combineMode", typeof(CombineModeEntity));
			if(_combineMode!=null)
			{
				_combineMode.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_combineModeReturnsNewIfNotFound = info.GetBoolean("_combineModeReturnsNewIfNotFound");
			_alwaysFetchCombineMode = info.GetBoolean("_alwaysFetchCombineMode");
			_alreadyFetchedCombineMode = info.GetBoolean("_alreadyFetchedCombineMode");
			_library = (LibraryEntity)info.GetValue("_library", typeof(LibraryEntity));
			if(_library!=null)
			{
				_library.AfterSave+=new EventHandler(OnEntityAfterSave);
			}
			_libraryReturnsNewIfNotFound = info.GetBoolean("_libraryReturnsNewIfNotFound");
			_alwaysFetchLibrary = info.GetBoolean("_alwaysFetchLibrary");
			_alreadyFetchedLibrary = info.GetBoolean("_alreadyFetchedLibrary");
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
			switch((PolicyFieldIndex)fieldIndex)
			{
				case PolicyFieldIndex.LibraryId:
					DesetupSyncLibrary(true, false);
					_alreadyFetchedLibrary = false;
					break;
				case PolicyFieldIndex.TargetId:
					DesetupSyncTarget(true, false);
					_alreadyFetchedTarget = false;
					break;
				case PolicyFieldIndex.CombineModeId:
					DesetupSyncCombineMode(true, false);
					_alreadyFetchedCombineMode = false;
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
			_alreadyFetchedPolicyLink = (_policyLink.Count > 0);
			_alreadyFetchedRule = (_rule.Count > 0);
			_alreadyFetchedDecisionNodeCollectionViaRule = (_decisionNodeCollectionViaRule.Count > 0);
			_alreadyFetchedEffectCollectionViaRule = (_effectCollectionViaRule.Count > 0);
			_alreadyFetchedPolicyLinkCollectionViaPolicyLink = (_policyLinkCollectionViaPolicyLink.Count > 0);
			_alreadyFetchedCombineMode = (_combineMode != null);
			_alreadyFetchedLibrary = (_library != null);
			_alreadyFetchedTarget = (_target != null);

		}
				
		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public override RelationCollection GetRelationsForFieldOfType(string fieldName)
		{
			return PolicyEntity.GetRelationsForField(fieldName);
		}

		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public static RelationCollection GetRelationsForField(string fieldName)
		{
			RelationCollection toReturn = new RelationCollection();
			switch(fieldName)
			{
				case "CombineMode":
					toReturn.Add(PolicyEntity.Relations.CombineModeEntityUsingCombineModeId);
					break;
				case "Library":
					toReturn.Add(PolicyEntity.Relations.LibraryEntityUsingLibraryId);
					break;
				case "Target":
					toReturn.Add(PolicyEntity.Relations.TargetEntityUsingTargetId);
					break;
				case "PolicyLink":
					toReturn.Add(PolicyEntity.Relations.PolicyLinkEntityUsingPolicyId);
					break;
				case "Rule":
					toReturn.Add(PolicyEntity.Relations.RuleEntityUsingPolicyId);
					break;
				case "DecisionNodeCollectionViaRule":
					toReturn.Add(PolicyEntity.Relations.RuleEntityUsingPolicyId, "PolicyEntity__", "Rule_", JoinHint.None);
					toReturn.Add(RuleEntity.Relations.DecisionNodeEntityUsingConditionId, "Rule_", string.Empty, JoinHint.None);
					break;
				case "EffectCollectionViaRule":
					toReturn.Add(PolicyEntity.Relations.RuleEntityUsingPolicyId, "PolicyEntity__", "Rule_", JoinHint.None);
					toReturn.Add(RuleEntity.Relations.EffectEntityUsingEffectId, "Rule_", string.Empty, JoinHint.None);
					break;
				case "PolicyLinkCollectionViaPolicyLink":
					toReturn.Add(PolicyEntity.Relations.PolicyLinkEntityUsingPolicyId, "PolicyEntity__", "PolicyLink_", JoinHint.None);
					toReturn.Add(PolicyLinkEntity.Relations.PolicyLinkEntityUsingParentId, "PolicyLink_", string.Empty, JoinHint.None);
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
			info.AddValue("_policyLink", (!this.MarkedForDeletion?_policyLink:null));
			info.AddValue("_alwaysFetchPolicyLink", _alwaysFetchPolicyLink);
			info.AddValue("_alreadyFetchedPolicyLink", _alreadyFetchedPolicyLink);
			info.AddValue("_rule", (!this.MarkedForDeletion?_rule:null));
			info.AddValue("_alwaysFetchRule", _alwaysFetchRule);
			info.AddValue("_alreadyFetchedRule", _alreadyFetchedRule);
			info.AddValue("_decisionNodeCollectionViaRule", (!this.MarkedForDeletion?_decisionNodeCollectionViaRule:null));
			info.AddValue("_alwaysFetchDecisionNodeCollectionViaRule", _alwaysFetchDecisionNodeCollectionViaRule);
			info.AddValue("_alreadyFetchedDecisionNodeCollectionViaRule", _alreadyFetchedDecisionNodeCollectionViaRule);
			info.AddValue("_effectCollectionViaRule", (!this.MarkedForDeletion?_effectCollectionViaRule:null));
			info.AddValue("_alwaysFetchEffectCollectionViaRule", _alwaysFetchEffectCollectionViaRule);
			info.AddValue("_alreadyFetchedEffectCollectionViaRule", _alreadyFetchedEffectCollectionViaRule);
			info.AddValue("_policyLinkCollectionViaPolicyLink", (!this.MarkedForDeletion?_policyLinkCollectionViaPolicyLink:null));
			info.AddValue("_alwaysFetchPolicyLinkCollectionViaPolicyLink", _alwaysFetchPolicyLinkCollectionViaPolicyLink);
			info.AddValue("_alreadyFetchedPolicyLinkCollectionViaPolicyLink", _alreadyFetchedPolicyLinkCollectionViaPolicyLink);
			info.AddValue("_combineMode", (!this.MarkedForDeletion?_combineMode:null));
			info.AddValue("_combineModeReturnsNewIfNotFound", _combineModeReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchCombineMode", _alwaysFetchCombineMode);
			info.AddValue("_alreadyFetchedCombineMode", _alreadyFetchedCombineMode);
			info.AddValue("_library", (!this.MarkedForDeletion?_library:null));
			info.AddValue("_libraryReturnsNewIfNotFound", _libraryReturnsNewIfNotFound);
			info.AddValue("_alwaysFetchLibrary", _alwaysFetchLibrary);
			info.AddValue("_alreadyFetchedLibrary", _alreadyFetchedLibrary);
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
				case "CombineMode":
					_alreadyFetchedCombineMode = true;
					this.CombineMode = (CombineModeEntity)entity;
					break;
				case "Library":
					_alreadyFetchedLibrary = true;
					this.Library = (LibraryEntity)entity;
					break;
				case "Target":
					_alreadyFetchedTarget = true;
					this.Target = (TargetEntity)entity;
					break;
				case "PolicyLink":
					_alreadyFetchedPolicyLink = true;
					if(entity!=null)
					{
						this.PolicyLink.Add((PolicyLinkEntity)entity);
					}
					break;
				case "Rule":
					_alreadyFetchedRule = true;
					if(entity!=null)
					{
						this.Rule.Add((RuleEntity)entity);
					}
					break;
				case "DecisionNodeCollectionViaRule":
					_alreadyFetchedDecisionNodeCollectionViaRule = true;
					if(entity!=null)
					{
						this.DecisionNodeCollectionViaRule.Add((DecisionNodeEntity)entity);
					}
					break;
				case "EffectCollectionViaRule":
					_alreadyFetchedEffectCollectionViaRule = true;
					if(entity!=null)
					{
						this.EffectCollectionViaRule.Add((EffectEntity)entity);
					}
					break;
				case "PolicyLinkCollectionViaPolicyLink":
					_alreadyFetchedPolicyLinkCollectionViaPolicyLink = true;
					if(entity!=null)
					{
						this.PolicyLinkCollectionViaPolicyLink.Add((PolicyLinkEntity)entity);
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
				case "CombineMode":
					SetupSyncCombineMode(relatedEntity);
					break;
				case "Library":
					SetupSyncLibrary(relatedEntity);
					break;
				case "Target":
					SetupSyncTarget(relatedEntity);
					break;
				case "PolicyLink":
					_policyLink.Add((PolicyLinkEntity)relatedEntity);
					break;
				case "Rule":
					_rule.Add((RuleEntity)relatedEntity);
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
				case "CombineMode":
					DesetupSyncCombineMode(false, true);
					break;
				case "Library":
					DesetupSyncLibrary(false, true);
					break;
				case "Target":
					DesetupSyncTarget(false, true);
					break;
				case "PolicyLink":
					base.PerformRelatedEntityRemoval(_policyLink, relatedEntity, signalRelatedEntityManyToOne);
					break;
				case "Rule":
					base.PerformRelatedEntityRemoval(_rule, relatedEntity, signalRelatedEntityManyToOne);
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
			if(_combineMode!=null)
			{
				toReturn.Add(_combineMode);
			}
			if(_library!=null)
			{
				toReturn.Add(_library);
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
			toReturn.Add(_policyLink);
			toReturn.Add(_rule);

			return toReturn;
		}

		

		

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Policy which data should be fetched into this Policy object</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id)
		{
			return FetchUsingPK(id, null, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Policy which data should be fetched into this Policy object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			return FetchUsingPK(id, prefetchPathToUse, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Policy which data should be fetched into this Policy object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse)
		{
			return Fetch(id, prefetchPathToUse, contextToUse, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Policy which data should be fetched into this Policy object</param>
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
		public bool TestOriginalFieldValueForNull(PolicyFieldIndex fieldIndex)
		{
			return base.Fields[(int)fieldIndex].IsNull;
		}
		
		/// <summary>Returns true if the current value for the field with the fieldIndex passed in represents null/not defined, false otherwise.
		/// Should not be used for testing if the original value (read from the db) is NULL</summary>
		/// <param name="fieldIndex">Index of the field to test if its currentvalue is null/undefined</param>
		/// <returns>true if the field's value isn't defined yet, false otherwise</returns>
		public bool TestCurrentFieldValueForNull(PolicyFieldIndex fieldIndex)
		{
			return base.CheckIfCurrentFieldValueIsNull((int)fieldIndex);
		}

				
		/// <summary>Gets a list of all the EntityRelation objects the type of this instance has.</summary>
		/// <returns>A list of all the EntityRelation objects the type of this instance has. Hierarchy relations are excluded.</returns>
		public override List<IEntityRelation> GetAllRelations()
		{
			return new PolicyRelations().GetAllRelations();
		}


		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'PolicyLinkEntity'</returns>
		public policyDB.CollectionClasses.PolicyLinkCollection GetMultiPolicyLink(bool forceFetch)
		{
			return GetMultiPolicyLink(forceFetch, _policyLink.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'PolicyLinkEntity'</returns>
		public policyDB.CollectionClasses.PolicyLinkCollection GetMultiPolicyLink(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiPolicyLink(forceFetch, _policyLink.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.PolicyLinkCollection GetMultiPolicyLink(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiPolicyLink(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.PolicyLinkCollection GetMultiPolicyLink(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedPolicyLink || forceFetch || _alwaysFetchPolicyLink) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_policyLink.ParticipatesInTransaction)
					{
						base.Transaction.Add(_policyLink);
					}
				}
				_policyLink.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_policyLink.EntityFactoryToUse = entityFactoryToUse;
				}
				_policyLink.GetMultiManyToOne(this, null, filter);
				_policyLink.SuppressClearInGetMulti=false;
				_alreadyFetchedPolicyLink = true;
			}
			return _policyLink;
		}

		/// <summary> Sets the collection parameters for the collection for 'PolicyLink'. These settings will be taken into account
		/// when the property PolicyLink is requested or GetMultiPolicyLink is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersPolicyLink(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_policyLink.SortClauses=sortClauses;
			_policyLink.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'RuleEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'RuleEntity'</returns>
		public policyDB.CollectionClasses.RuleCollection GetMultiRule(bool forceFetch)
		{
			return GetMultiRule(forceFetch, _rule.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'RuleEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'RuleEntity'</returns>
		public policyDB.CollectionClasses.RuleCollection GetMultiRule(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiRule(forceFetch, _rule.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'RuleEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.RuleCollection GetMultiRule(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiRule(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'RuleEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.RuleCollection GetMultiRule(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedRule || forceFetch || _alwaysFetchRule) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_rule.ParticipatesInTransaction)
					{
						base.Transaction.Add(_rule);
					}
				}
				_rule.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_rule.EntityFactoryToUse = entityFactoryToUse;
				}
				_rule.GetMultiManyToOne(null, null, this, filter);
				_rule.SuppressClearInGetMulti=false;
				_alreadyFetchedRule = true;
			}
			return _rule;
		}

		/// <summary> Sets the collection parameters for the collection for 'Rule'. These settings will be taken into account
		/// when the property Rule is requested or GetMultiRule is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersRule(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_rule.SortClauses=sortClauses;
			_rule.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'DecisionNodeEntity'</returns>
		public policyDB.CollectionClasses.DecisionNodeCollection GetMultiDecisionNodeCollectionViaRule(bool forceFetch)
		{
			return GetMultiDecisionNodeCollectionViaRule(forceFetch, _decisionNodeCollectionViaRule.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.DecisionNodeCollection GetMultiDecisionNodeCollectionViaRule(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedDecisionNodeCollectionViaRule || forceFetch || _alwaysFetchDecisionNodeCollectionViaRule) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_decisionNodeCollectionViaRule.ParticipatesInTransaction)
					{
						base.Transaction.Add(_decisionNodeCollectionViaRule);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(PolicyFields.Id, ComparisonOperator.Equal, this.Id, "PolicyEntity__"));
				_decisionNodeCollectionViaRule.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_decisionNodeCollectionViaRule.EntityFactoryToUse = entityFactoryToUse;
				}
				_decisionNodeCollectionViaRule.GetMulti(filter, GetRelationsForField("DecisionNodeCollectionViaRule"));
				_decisionNodeCollectionViaRule.SuppressClearInGetMulti=false;
				_alreadyFetchedDecisionNodeCollectionViaRule = true;
			}
			return _decisionNodeCollectionViaRule;
		}

		/// <summary> Sets the collection parameters for the collection for 'DecisionNodeCollectionViaRule'. These settings will be taken into account
		/// when the property DecisionNodeCollectionViaRule is requested or GetMultiDecisionNodeCollectionViaRule is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersDecisionNodeCollectionViaRule(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_decisionNodeCollectionViaRule.SortClauses=sortClauses;
			_decisionNodeCollectionViaRule.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'EffectEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'EffectEntity'</returns>
		public policyDB.CollectionClasses.EffectCollection GetMultiEffectCollectionViaRule(bool forceFetch)
		{
			return GetMultiEffectCollectionViaRule(forceFetch, _effectCollectionViaRule.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'EffectEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.EffectCollection GetMultiEffectCollectionViaRule(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedEffectCollectionViaRule || forceFetch || _alwaysFetchEffectCollectionViaRule) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_effectCollectionViaRule.ParticipatesInTransaction)
					{
						base.Transaction.Add(_effectCollectionViaRule);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(PolicyFields.Id, ComparisonOperator.Equal, this.Id, "PolicyEntity__"));
				_effectCollectionViaRule.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_effectCollectionViaRule.EntityFactoryToUse = entityFactoryToUse;
				}
				_effectCollectionViaRule.GetMulti(filter, GetRelationsForField("EffectCollectionViaRule"));
				_effectCollectionViaRule.SuppressClearInGetMulti=false;
				_alreadyFetchedEffectCollectionViaRule = true;
			}
			return _effectCollectionViaRule;
		}

		/// <summary> Sets the collection parameters for the collection for 'EffectCollectionViaRule'. These settings will be taken into account
		/// when the property EffectCollectionViaRule is requested or GetMultiEffectCollectionViaRule is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersEffectCollectionViaRule(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_effectCollectionViaRule.SortClauses=sortClauses;
			_effectCollectionViaRule.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'PolicyLinkEntity'</returns>
		public policyDB.CollectionClasses.PolicyLinkCollection GetMultiPolicyLinkCollectionViaPolicyLink(bool forceFetch)
		{
			return GetMultiPolicyLinkCollectionViaPolicyLink(forceFetch, _policyLinkCollectionViaPolicyLink.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.PolicyLinkCollection GetMultiPolicyLinkCollectionViaPolicyLink(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedPolicyLinkCollectionViaPolicyLink || forceFetch || _alwaysFetchPolicyLinkCollectionViaPolicyLink) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_policyLinkCollectionViaPolicyLink.ParticipatesInTransaction)
					{
						base.Transaction.Add(_policyLinkCollectionViaPolicyLink);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(PolicyFields.Id, ComparisonOperator.Equal, this.Id, "PolicyEntity__"));
				_policyLinkCollectionViaPolicyLink.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_policyLinkCollectionViaPolicyLink.EntityFactoryToUse = entityFactoryToUse;
				}
				_policyLinkCollectionViaPolicyLink.GetMulti(filter, GetRelationsForField("PolicyLinkCollectionViaPolicyLink"));
				_policyLinkCollectionViaPolicyLink.SuppressClearInGetMulti=false;
				_alreadyFetchedPolicyLinkCollectionViaPolicyLink = true;
			}
			return _policyLinkCollectionViaPolicyLink;
		}

		/// <summary> Sets the collection parameters for the collection for 'PolicyLinkCollectionViaPolicyLink'. These settings will be taken into account
		/// when the property PolicyLinkCollectionViaPolicyLink is requested or GetMultiPolicyLinkCollectionViaPolicyLink is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersPolicyLinkCollectionViaPolicyLink(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_policyLinkCollectionViaPolicyLink.SortClauses=sortClauses;
			_policyLinkCollectionViaPolicyLink.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves the related entity of type 'CombineModeEntity', using a relation of type 'n:1'</summary>
		/// <returns>A fetched entity of type 'CombineModeEntity' which is related to this entity.</returns>
		public CombineModeEntity GetSingleCombineMode()
		{
			return GetSingleCombineMode(false);
		}

		/// <summary> Retrieves the related entity of type 'CombineModeEntity', using a relation of type 'n:1'</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the currently loaded related entity and will refetch the entity from the persistent storage</param>
		/// <returns>A fetched entity of type 'CombineModeEntity' which is related to this entity.</returns>
		public virtual CombineModeEntity GetSingleCombineMode(bool forceFetch)
		{
			if( ( !_alreadyFetchedCombineMode || forceFetch || _alwaysFetchCombineMode) && !base.IsSerializing && !base.IsDeserializing  && !base.InDesignMode)			
			{
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(PolicyEntity.Relations.CombineModeEntityUsingCombineModeId);

				CombineModeEntity newEntity = new CombineModeEntity();
				if(base.ParticipatesInTransaction)
				{
					base.Transaction.Add(newEntity);
				}
				bool fetchResult = false;
				if(performLazyLoading)
				{
					fetchResult = newEntity.FetchUsingPK(this.CombineModeId);
				}
				if(fetchResult)
				{
					if(base.ActiveContext!=null)
					{
						newEntity = (CombineModeEntity)base.ActiveContext.Get(newEntity);
					}
					this.CombineMode = newEntity;
				}
				else
				{
					if(_combineModeReturnsNewIfNotFound)
					{
						if(performLazyLoading || (!performLazyLoading && (_combineMode == null)))
						{
							this.CombineMode = newEntity;
						}
					}
					else
					{
						this.CombineMode = null;
					}
				}
				_alreadyFetchedCombineMode = fetchResult;
				if(base.ParticipatesInTransaction && !fetchResult)
				{
					base.Transaction.Remove(newEntity);
				}
			}
			return _combineMode;
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
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(PolicyEntity.Relations.LibraryEntityUsingLibraryId);

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
				bool performLazyLoading = base.CheckIfLazyLoadingShouldOccur(PolicyEntity.Relations.TargetEntityUsingTargetId);

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
			PolicyDAO dao = (PolicyDAO)CreateDAOInstance();
			return dao.AddNew(base.Fields, base.Transaction);
		}
		
		/// <summary> Adds the internals to the active context. </summary>
		protected override void AddInternalsToContext()
		{
			_policyLink.ActiveContext = base.ActiveContext;
			_rule.ActiveContext = base.ActiveContext;
			_decisionNodeCollectionViaRule.ActiveContext = base.ActiveContext;
			_effectCollectionViaRule.ActiveContext = base.ActiveContext;
			_policyLinkCollectionViaPolicyLink.ActiveContext = base.ActiveContext;
			if(_combineMode!=null)
			{
				_combineMode.ActiveContext = base.ActiveContext;
			}
			if(_library!=null)
			{
				_library.ActiveContext = base.ActiveContext;
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
			PolicyDAO dao = (PolicyDAO)CreateDAOInstance();
			return dao.UpdateExisting(base.Fields, base.Transaction);
		}
		
		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <param name="updateRestriction">Predicate expression, meant for concurrency checks in an Update query</param>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity(IPredicate updateRestriction)
		{
			PolicyDAO dao = (PolicyDAO)CreateDAOInstance();
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
			return EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.PolicyEntity);
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
			toReturn.Add("CombineMode", _combineMode);
			toReturn.Add("Library", _library);
			toReturn.Add("Target", _target);
			toReturn.Add("PolicyLink", _policyLink);
			toReturn.Add("Rule", _rule);
			toReturn.Add("DecisionNodeCollectionViaRule", _decisionNodeCollectionViaRule);
			toReturn.Add("EffectCollectionViaRule", _effectCollectionViaRule);
			toReturn.Add("PolicyLinkCollectionViaPolicyLink", _policyLinkCollectionViaPolicyLink);

			return toReturn;
		}
		

		/// <summary> Initializes the the entity and fetches the data related to the entity in this entity.</summary>
		/// <param name="id">PK value for Policy which data should be fetched into this Policy object</param>
		/// <param name="validator">The validator object for this PolicyEntity</param>
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
			_policyLink = new policyDB.CollectionClasses.PolicyLinkCollection(new PolicyLinkEntityFactory());
			_policyLink.SetContainingEntityInfo(this, "Policy");
			_alwaysFetchPolicyLink = false;
			_alreadyFetchedPolicyLink = false;
			_rule = new policyDB.CollectionClasses.RuleCollection(new RuleEntityFactory());
			_rule.SetContainingEntityInfo(this, "Policy");
			_alwaysFetchRule = false;
			_alreadyFetchedRule = false;
			_decisionNodeCollectionViaRule = new policyDB.CollectionClasses.DecisionNodeCollection(new DecisionNodeEntityFactory());
			_alwaysFetchDecisionNodeCollectionViaRule = false;
			_alreadyFetchedDecisionNodeCollectionViaRule = false;
			_effectCollectionViaRule = new policyDB.CollectionClasses.EffectCollection(new EffectEntityFactory());
			_alwaysFetchEffectCollectionViaRule = false;
			_alreadyFetchedEffectCollectionViaRule = false;
			_policyLinkCollectionViaPolicyLink = new policyDB.CollectionClasses.PolicyLinkCollection(new PolicyLinkEntityFactory());
			_alwaysFetchPolicyLinkCollectionViaPolicyLink = false;
			_alreadyFetchedPolicyLinkCollectionViaPolicyLink = false;
			_combineMode = null;
			_combineModeReturnsNewIfNotFound = true;
			_alwaysFetchCombineMode = false;
			_alreadyFetchedCombineMode = false;
			_library = null;
			_libraryReturnsNewIfNotFound = true;
			_alwaysFetchLibrary = false;
			_alreadyFetchedLibrary = false;
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

			_fieldsCustomProperties.Add("Id", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("LibraryId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Uid", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Description", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("TargetId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("CombineModeId", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Set", fieldHashtable);
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("IsLibrary", fieldHashtable);
		}
		#endregion


		/// <summary> Removes the sync logic for member _combineMode</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncCombineMode(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _combineMode, new PropertyChangedEventHandler( OnCombineModePropertyChanged ), "CombineMode", PolicyEntity.Relations.CombineModeEntityUsingCombineModeId, true, signalRelatedEntity, "Policy", resetFKFields, new int[] { (int)PolicyFieldIndex.CombineModeId } );		
			_combineMode = null;
		}
		
		/// <summary> setups the sync logic for member _combineMode</summary>
		/// <param name="relatedEntity">Instance to set as the related entity of type entityType</param>
		private void SetupSyncCombineMode(IEntity relatedEntity)
		{
			if(_combineMode!=relatedEntity)
			{		
				DesetupSyncCombineMode(true, true);
				_combineMode = (CombineModeEntity)relatedEntity;
				base.PerformSetupSyncRelatedEntity( _combineMode, new PropertyChangedEventHandler( OnCombineModePropertyChanged ), "CombineMode", PolicyEntity.Relations.CombineModeEntityUsingCombineModeId, true, ref _alreadyFetchedCombineMode, new string[] {  } );
			}
		}

		/// <summary>Handles property change events of properties in a related entity.</summary>
		/// <param name="sender"></param>
		/// <param name="e"></param>
		private void OnCombineModePropertyChanged( object sender, PropertyChangedEventArgs e )
		{
			switch( e.PropertyName )
			{
				default:
					break;
			}
		}

		/// <summary> Removes the sync logic for member _library</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncLibrary(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _library, new PropertyChangedEventHandler( OnLibraryPropertyChanged ), "Library", PolicyEntity.Relations.LibraryEntityUsingLibraryId, true, signalRelatedEntity, "Policy", resetFKFields, new int[] { (int)PolicyFieldIndex.LibraryId } );		
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
				base.PerformSetupSyncRelatedEntity( _library, new PropertyChangedEventHandler( OnLibraryPropertyChanged ), "Library", PolicyEntity.Relations.LibraryEntityUsingLibraryId, true, ref _alreadyFetchedLibrary, new string[] {  } );
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

		/// <summary> Removes the sync logic for member _target</summary>
		/// <param name="signalRelatedEntity">If set to true, it will call the related entity's UnsetRelatedEntity method</param>
		/// <param name="resetFKFields">if set to true it will also reset the FK fields pointing to the related entity</param>
		private void DesetupSyncTarget(bool signalRelatedEntity, bool resetFKFields)
		{
			base.PerformDesetupSyncRelatedEntity( _target, new PropertyChangedEventHandler( OnTargetPropertyChanged ), "Target", PolicyEntity.Relations.TargetEntityUsingTargetId, true, signalRelatedEntity, "Policy", resetFKFields, new int[] { (int)PolicyFieldIndex.TargetId } );		
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
				base.PerformSetupSyncRelatedEntity( _target, new PropertyChangedEventHandler( OnTargetPropertyChanged ), "Target", PolicyEntity.Relations.TargetEntityUsingTargetId, true, ref _alreadyFetchedTarget, new string[] {  } );
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
		/// <param name="id">PK value for Policy which data should be fetched into this Policy object</param>
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
				base.Fields[(int)PolicyFieldIndex.Id].ForcedCurrentValueWrite(id);
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
			return DAOFactory.CreatePolicyDAO();
		}
		
		/// <summary> Creates the entity factory for this type.</summary>
		/// <returns></returns>
		protected override IEntityFactory CreateEntityFactory()
		{
			return new PolicyEntityFactory();
		}

		#region Class Property Declarations
		/// <summary> The relations object holding all relations of this entity with other entity classes.</summary>
		public  static PolicyRelations Relations
		{
			get	{ return new PolicyRelations(); }
		}
		
		/// <summary> The custom properties for this entity type.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		public  static Dictionary<string, string> CustomProperties
		{
			get { return _customProperties;}
		}


		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'PolicyLink' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathPolicyLink
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.PolicyLinkCollection(),
					(IEntityRelation)GetRelationsForField("PolicyLink")[0], (int)policyDB.EntityType.PolicyEntity, (int)policyDB.EntityType.PolicyLinkEntity, 0, null, null, null, "PolicyLink", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Rule' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathRule
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.RuleCollection(),
					(IEntityRelation)GetRelationsForField("Rule")[0], (int)policyDB.EntityType.PolicyEntity, (int)policyDB.EntityType.RuleEntity, 0, null, null, null, "Rule", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'DecisionNode' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathDecisionNodeCollectionViaRule
		{
			get
			{
				IEntityRelation intermediateRelation = PolicyEntity.Relations.RuleEntityUsingPolicyId;
				intermediateRelation.SetAliases(string.Empty, "Rule_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.DecisionNodeCollection(), intermediateRelation,
					(int)policyDB.EntityType.PolicyEntity, (int)policyDB.EntityType.DecisionNodeEntity, 0, null, null, GetRelationsForField("DecisionNodeCollectionViaRule"), "DecisionNodeCollectionViaRule", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Effect' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathEffectCollectionViaRule
		{
			get
			{
				IEntityRelation intermediateRelation = PolicyEntity.Relations.RuleEntityUsingPolicyId;
				intermediateRelation.SetAliases(string.Empty, "Rule_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.EffectCollection(), intermediateRelation,
					(int)policyDB.EntityType.PolicyEntity, (int)policyDB.EntityType.EffectEntity, 0, null, null, GetRelationsForField("EffectCollectionViaRule"), "EffectCollectionViaRule", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'PolicyLink' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathPolicyLinkCollectionViaPolicyLink
		{
			get
			{
				IEntityRelation intermediateRelation = PolicyEntity.Relations.PolicyLinkEntityUsingPolicyId;
				intermediateRelation.SetAliases(string.Empty, "PolicyLink_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.PolicyLinkCollection(), intermediateRelation,
					(int)policyDB.EntityType.PolicyEntity, (int)policyDB.EntityType.PolicyLinkEntity, 0, null, null, GetRelationsForField("PolicyLinkCollectionViaPolicyLink"), "PolicyLinkCollectionViaPolicyLink", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'CombineMode' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathCombineMode
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.CombineModeCollection(),
					(IEntityRelation)GetRelationsForField("CombineMode")[0], (int)policyDB.EntityType.PolicyEntity, (int)policyDB.EntityType.CombineModeEntity, 0, null, null, null, "CombineMode", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
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
					(IEntityRelation)GetRelationsForField("Library")[0], (int)policyDB.EntityType.PolicyEntity, (int)policyDB.EntityType.LibraryEntity, 0, null, null, null, "Library", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
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
					(IEntityRelation)GetRelationsForField("Target")[0], (int)policyDB.EntityType.PolicyEntity, (int)policyDB.EntityType.TargetEntity, 0, null, null, null, "Target", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne);
			}
		}


		/// <summary>Returns the full name for this entity, which is important for the DAO to find back persistence info for this entity.</summary>
		[Browsable(false), XmlIgnore]
		public override string LLBLGenProEntityName
		{
			get { return "PolicyEntity";}
		}

		/// <summary> The custom properties for the type of this entity instance.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		[Browsable(false), XmlIgnore]
		public override Dictionary<string, string> CustomPropertiesOfType
		{
			get { return PolicyEntity.CustomProperties;}
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
			get { return PolicyEntity.FieldsCustomProperties;}
		}

		/// <summary> The Id property of the Entity Policy<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "policy"."id"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, true, true</remarks>
		public virtual System.Int32 Id
		{
			get { return (System.Int32)GetValue((int)PolicyFieldIndex.Id, true); }
			set	{ SetValue((int)PolicyFieldIndex.Id, value, true); }
		}
		/// <summary> The LibraryId property of the Entity Policy<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "policy"."libraryId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 LibraryId
		{
			get { return (System.Int32)GetValue((int)PolicyFieldIndex.LibraryId, true); }
			set	{ SetValue((int)PolicyFieldIndex.LibraryId, value, true); }
		}
		/// <summary> The Uid property of the Entity Policy<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "policy"."uid"<br/>
		/// Table field type characteristics (type, precision, scale, length): UniqueIdentifier, 0, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Guid Uid
		{
			get { return (System.Guid)GetValue((int)PolicyFieldIndex.Uid, true); }
			set	{ SetValue((int)PolicyFieldIndex.Uid, value, true); }
		}
		/// <summary> The Description property of the Entity Policy<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "policy"."description"<br/>
		/// Table field type characteristics (type, precision, scale, length): NVarChar, 0, 0, 500<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.String Description
		{
			get { return (System.String)GetValue((int)PolicyFieldIndex.Description, true); }
			set	{ SetValue((int)PolicyFieldIndex.Description, value, true); }
		}
		/// <summary> The TargetId property of the Entity Policy<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "policy"."targetId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 TargetId
		{
			get { return (System.Int32)GetValue((int)PolicyFieldIndex.TargetId, true); }
			set	{ SetValue((int)PolicyFieldIndex.TargetId, value, true); }
		}
		/// <summary> The CombineModeId property of the Entity Policy<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "policy"."combineModeId"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Int32 CombineModeId
		{
			get { return (System.Int32)GetValue((int)PolicyFieldIndex.CombineModeId, true); }
			set	{ SetValue((int)PolicyFieldIndex.CombineModeId, value, true); }
		}
		/// <summary> The Set property of the Entity Policy<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "policy"."set"<br/>
		/// Table field type characteristics (type, precision, scale, length): Bit, 1, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Boolean Set
		{
			get { return (System.Boolean)GetValue((int)PolicyFieldIndex.Set, true); }
			set	{ SetValue((int)PolicyFieldIndex.Set, value, true); }
		}
		/// <summary> The IsLibrary property of the Entity Policy<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "policy"."isLibrary"<br/>
		/// Table field type characteristics (type, precision, scale, length): Bit, 1, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Boolean IsLibrary
		{
			get { return (System.Boolean)GetValue((int)PolicyFieldIndex.IsLibrary, true); }
			set	{ SetValue((int)PolicyFieldIndex.IsLibrary, value, true); }
		}

		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiPolicyLink()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.PolicyLinkCollection PolicyLink
		{
			get	{ return GetMultiPolicyLink(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for PolicyLink. When set to true, PolicyLink is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time PolicyLink is accessed. You can always execute
		/// a forced fetch by calling GetMultiPolicyLink(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchPolicyLink
		{
			get	{ return _alwaysFetchPolicyLink; }
			set	{ _alwaysFetchPolicyLink = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property PolicyLink already has been fetched. Setting this property to false when PolicyLink has been fetched
		/// will clear the PolicyLink collection well. Setting this property to true while PolicyLink hasn't been fetched disables lazy loading for PolicyLink</summary>
		[Browsable(false)]
		public bool AlreadyFetchedPolicyLink
		{
			get { return _alreadyFetchedPolicyLink;}
			set 
			{
				if(_alreadyFetchedPolicyLink && !value && (_policyLink != null))
				{
					_policyLink.Clear();
				}
				_alreadyFetchedPolicyLink = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'RuleEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiRule()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.RuleCollection Rule
		{
			get	{ return GetMultiRule(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for Rule. When set to true, Rule is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Rule is accessed. You can always execute
		/// a forced fetch by calling GetMultiRule(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchRule
		{
			get	{ return _alwaysFetchRule; }
			set	{ _alwaysFetchRule = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property Rule already has been fetched. Setting this property to false when Rule has been fetched
		/// will clear the Rule collection well. Setting this property to true while Rule hasn't been fetched disables lazy loading for Rule</summary>
		[Browsable(false)]
		public bool AlreadyFetchedRule
		{
			get { return _alreadyFetchedRule;}
			set 
			{
				if(_alreadyFetchedRule && !value && (_rule != null))
				{
					_rule.Clear();
				}
				_alreadyFetchedRule = value;
			}
		}

		/// <summary> Retrieves all related entities of type 'DecisionNodeEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiDecisionNodeCollectionViaRule()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.DecisionNodeCollection DecisionNodeCollectionViaRule
		{
			get { return GetMultiDecisionNodeCollectionViaRule(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for DecisionNodeCollectionViaRule. When set to true, DecisionNodeCollectionViaRule is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time DecisionNodeCollectionViaRule is accessed. You can always execute
		/// a forced fetch by calling GetMultiDecisionNodeCollectionViaRule(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchDecisionNodeCollectionViaRule
		{
			get	{ return _alwaysFetchDecisionNodeCollectionViaRule; }
			set	{ _alwaysFetchDecisionNodeCollectionViaRule = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property DecisionNodeCollectionViaRule already has been fetched. Setting this property to false when DecisionNodeCollectionViaRule has been fetched
		/// will clear the DecisionNodeCollectionViaRule collection well. Setting this property to true while DecisionNodeCollectionViaRule hasn't been fetched disables lazy loading for DecisionNodeCollectionViaRule</summary>
		[Browsable(false)]
		public bool AlreadyFetchedDecisionNodeCollectionViaRule
		{
			get { return _alreadyFetchedDecisionNodeCollectionViaRule;}
			set 
			{
				if(_alreadyFetchedDecisionNodeCollectionViaRule && !value && (_decisionNodeCollectionViaRule != null))
				{
					_decisionNodeCollectionViaRule.Clear();
				}
				_alreadyFetchedDecisionNodeCollectionViaRule = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'EffectEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiEffectCollectionViaRule()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.EffectCollection EffectCollectionViaRule
		{
			get { return GetMultiEffectCollectionViaRule(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for EffectCollectionViaRule. When set to true, EffectCollectionViaRule is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time EffectCollectionViaRule is accessed. You can always execute
		/// a forced fetch by calling GetMultiEffectCollectionViaRule(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchEffectCollectionViaRule
		{
			get	{ return _alwaysFetchEffectCollectionViaRule; }
			set	{ _alwaysFetchEffectCollectionViaRule = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property EffectCollectionViaRule already has been fetched. Setting this property to false when EffectCollectionViaRule has been fetched
		/// will clear the EffectCollectionViaRule collection well. Setting this property to true while EffectCollectionViaRule hasn't been fetched disables lazy loading for EffectCollectionViaRule</summary>
		[Browsable(false)]
		public bool AlreadyFetchedEffectCollectionViaRule
		{
			get { return _alreadyFetchedEffectCollectionViaRule;}
			set 
			{
				if(_alreadyFetchedEffectCollectionViaRule && !value && (_effectCollectionViaRule != null))
				{
					_effectCollectionViaRule.Clear();
				}
				_alreadyFetchedEffectCollectionViaRule = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiPolicyLinkCollectionViaPolicyLink()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.PolicyLinkCollection PolicyLinkCollectionViaPolicyLink
		{
			get { return GetMultiPolicyLinkCollectionViaPolicyLink(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for PolicyLinkCollectionViaPolicyLink. When set to true, PolicyLinkCollectionViaPolicyLink is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time PolicyLinkCollectionViaPolicyLink is accessed. You can always execute
		/// a forced fetch by calling GetMultiPolicyLinkCollectionViaPolicyLink(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchPolicyLinkCollectionViaPolicyLink
		{
			get	{ return _alwaysFetchPolicyLinkCollectionViaPolicyLink; }
			set	{ _alwaysFetchPolicyLinkCollectionViaPolicyLink = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property PolicyLinkCollectionViaPolicyLink already has been fetched. Setting this property to false when PolicyLinkCollectionViaPolicyLink has been fetched
		/// will clear the PolicyLinkCollectionViaPolicyLink collection well. Setting this property to true while PolicyLinkCollectionViaPolicyLink hasn't been fetched disables lazy loading for PolicyLinkCollectionViaPolicyLink</summary>
		[Browsable(false)]
		public bool AlreadyFetchedPolicyLinkCollectionViaPolicyLink
		{
			get { return _alreadyFetchedPolicyLinkCollectionViaPolicyLink;}
			set 
			{
				if(_alreadyFetchedPolicyLinkCollectionViaPolicyLink && !value && (_policyLinkCollectionViaPolicyLink != null))
				{
					_policyLinkCollectionViaPolicyLink.Clear();
				}
				_alreadyFetchedPolicyLinkCollectionViaPolicyLink = value;
			}
		}

		/// <summary> Gets / sets related entity of type 'CombineModeEntity'. This property is not visible in databound grids.
		/// Setting this property to a new object will make the load-on-demand feature to stop fetching data from the database, until you set this
		/// property to null. Setting this property to an entity will make sure that FK-PK relations are synchronized when appropriate.</summary>
		/// <remarks>This property is added for conveniance, however it is recommeded to use the method 'GetSingleCombineMode()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the
		/// same scope. The property is marked non-browsable to make it hidden in bound controls, f.e. datagrids.</remarks>
		[Browsable(false)]
		public virtual CombineModeEntity CombineMode
		{
			get	{ return GetSingleCombineMode(false); }
			set
			{
				if(base.IsDeserializing)
				{
					SetupSyncCombineMode(value);
				}
				else
				{
					if(value==null)
					{
						if(_combineMode != null)
						{
							_combineMode.UnsetRelatedEntity(this, "Policy");
						}
					}
					else
					{
						if(_combineMode!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "Policy");
						}
					}
				}
			}
		}

		/// <summary> Gets / sets the lazy loading flag for CombineMode. When set to true, CombineMode is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time CombineMode is accessed. You can always execute
		/// a forced fetch by calling GetSingleCombineMode(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchCombineMode
		{
			get	{ return _alwaysFetchCombineMode; }
			set	{ _alwaysFetchCombineMode = value; }	
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property CombineMode already has been fetched. Setting this property to false when CombineMode has been fetched
		/// will set CombineMode to null as well. Setting this property to true while CombineMode hasn't been fetched disables lazy loading for CombineMode</summary>
		[Browsable(false)]
		public bool AlreadyFetchedCombineMode
		{
			get { return _alreadyFetchedCombineMode;}
			set 
			{
				if(_alreadyFetchedCombineMode && !value)
				{
					this.CombineMode = null;
				}
				_alreadyFetchedCombineMode = value;
			}
		}

		/// <summary> Gets / sets the flag for what to do if the related entity available through the property CombineMode is not found
		/// in the database. When set to true, CombineMode will return a new entity instance if the related entity is not found, otherwise 
		/// null be returned if the related entity is not found. Default: true.</summary>
		[Browsable(false)]
		public bool CombineModeReturnsNewIfNotFound
		{
			get	{ return _combineModeReturnsNewIfNotFound; }
			set { _combineModeReturnsNewIfNotFound = value; }	
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
							_library.UnsetRelatedEntity(this, "Policy");
						}
					}
					else
					{
						if(_library!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "Policy");
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
							_target.UnsetRelatedEntity(this, "Policy");
						}
					}
					else
					{
						if(_target!=value)
						{
							((IEntity)value).SetRelatedEntity(this, "Policy");
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
			get { return (int)policyDB.EntityType.PolicyEntity; }
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
