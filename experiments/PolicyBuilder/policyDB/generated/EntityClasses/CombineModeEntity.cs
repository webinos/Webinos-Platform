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
	/// Entity class which represents the entity 'CombineMode'. <br/><br/>
	/// 
	/// </summary>
	[Serializable]
	public partial class CombineModeEntity : CommonEntityBase, ISerializable
		// __LLBLGENPRO_USER_CODE_REGION_START AdditionalInterfaces
		// __LLBLGENPRO_USER_CODE_REGION_END	
	{
		#region Class Member Declarations
		private policyDB.CollectionClasses.PolicyCollection	_policy;
		private bool	_alwaysFetchPolicy, _alreadyFetchedPolicy;
		private policyDB.CollectionClasses.LibraryCollection _libraryCollectionViaPolicy;
		private bool	_alwaysFetchLibraryCollectionViaPolicy, _alreadyFetchedLibraryCollectionViaPolicy;
		private policyDB.CollectionClasses.TargetCollection _targetCollectionViaPolicy;
		private bool	_alwaysFetchTargetCollectionViaPolicy, _alreadyFetchedTargetCollectionViaPolicy;


		
		// __LLBLGENPRO_USER_CODE_REGION_START PrivateMembers
		// __LLBLGENPRO_USER_CODE_REGION_END
		#endregion

		#region Statics
		private static Dictionary<string, string>	_customProperties;
		private static Dictionary<string, Dictionary<string, string>>	_fieldsCustomProperties;

		/// <summary>All names of fields mapped onto a relation. Usable for in-memory filtering</summary>
		public static class MemberNames
		{

			/// <summary>Member name Policy</summary>
			public static readonly string Policy = "Policy";
			/// <summary>Member name LibraryCollectionViaPolicy</summary>
			public static readonly string LibraryCollectionViaPolicy = "LibraryCollectionViaPolicy";
			/// <summary>Member name TargetCollectionViaPolicy</summary>
			public static readonly string TargetCollectionViaPolicy = "TargetCollectionViaPolicy";

		}
		#endregion
		
		/// <summary>Static CTor for setting up custom property hashtables. Is executed before the first instance of this entity class or derived classes is constructed. </summary>
		static CombineModeEntity()
		{
			SetupCustomPropertyHashtables();
		}

		/// <summary>CTor</summary>
		public CombineModeEntity()
		{
			InitClassEmpty(null);
		}


		/// <summary>CTor</summary>
		/// <param name="id">PK value for CombineMode which data should be fetched into this CombineMode object</param>
		public CombineModeEntity(System.Int32 id)
		{
			InitClassFetch(id, null, null);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for CombineMode which data should be fetched into this CombineMode object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		public CombineModeEntity(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			InitClassFetch(id, null, prefetchPathToUse);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for CombineMode which data should be fetched into this CombineMode object</param>
		/// <param name="validator">The custom validator object for this CombineModeEntity</param>
		public CombineModeEntity(System.Int32 id, IValidator validator)
		{
			InitClassFetch(id, validator, null);
		}


		/// <summary>Private CTor for deserialization</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		protected CombineModeEntity(SerializationInfo info, StreamingContext context) : base(info, context)
		{
			_policy = (policyDB.CollectionClasses.PolicyCollection)info.GetValue("_policy", typeof(policyDB.CollectionClasses.PolicyCollection));
			_alwaysFetchPolicy = info.GetBoolean("_alwaysFetchPolicy");
			_alreadyFetchedPolicy = info.GetBoolean("_alreadyFetchedPolicy");
			_libraryCollectionViaPolicy = (policyDB.CollectionClasses.LibraryCollection)info.GetValue("_libraryCollectionViaPolicy", typeof(policyDB.CollectionClasses.LibraryCollection));
			_alwaysFetchLibraryCollectionViaPolicy = info.GetBoolean("_alwaysFetchLibraryCollectionViaPolicy");
			_alreadyFetchedLibraryCollectionViaPolicy = info.GetBoolean("_alreadyFetchedLibraryCollectionViaPolicy");
			_targetCollectionViaPolicy = (policyDB.CollectionClasses.TargetCollection)info.GetValue("_targetCollectionViaPolicy", typeof(policyDB.CollectionClasses.TargetCollection));
			_alwaysFetchTargetCollectionViaPolicy = info.GetBoolean("_alwaysFetchTargetCollectionViaPolicy");
			_alreadyFetchedTargetCollectionViaPolicy = info.GetBoolean("_alreadyFetchedTargetCollectionViaPolicy");


			base.FixupDeserialization(FieldInfoProviderSingleton.GetInstance(), PersistenceInfoProviderSingleton.GetInstance());
			
			// __LLBLGENPRO_USER_CODE_REGION_START DeserializationConstructor
			// __LLBLGENPRO_USER_CODE_REGION_END
		}

		
		/// <summary>Performs the desync setup when an FK field has been changed. The entity referenced based on the FK field will be dereferenced and sync info will be removed.</summary>
		/// <param name="fieldIndex">The fieldindex.</param>
		protected override void PerformDesyncSetupFKFieldChange(int fieldIndex)
		{
			switch((CombineModeFieldIndex)fieldIndex)
			{
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
			_alreadyFetchedPolicy = (_policy.Count > 0);
			_alreadyFetchedLibraryCollectionViaPolicy = (_libraryCollectionViaPolicy.Count > 0);
			_alreadyFetchedTargetCollectionViaPolicy = (_targetCollectionViaPolicy.Count > 0);


		}
				
		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public override RelationCollection GetRelationsForFieldOfType(string fieldName)
		{
			return CombineModeEntity.GetRelationsForField(fieldName);
		}

		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public static RelationCollection GetRelationsForField(string fieldName)
		{
			RelationCollection toReturn = new RelationCollection();
			switch(fieldName)
			{

				case "Policy":
					toReturn.Add(CombineModeEntity.Relations.PolicyEntityUsingCombineModeId);
					break;
				case "LibraryCollectionViaPolicy":
					toReturn.Add(CombineModeEntity.Relations.PolicyEntityUsingCombineModeId, "CombineModeEntity__", "Policy_", JoinHint.None);
					toReturn.Add(PolicyEntity.Relations.LibraryEntityUsingLibraryId, "Policy_", string.Empty, JoinHint.None);
					break;
				case "TargetCollectionViaPolicy":
					toReturn.Add(CombineModeEntity.Relations.PolicyEntityUsingCombineModeId, "CombineModeEntity__", "Policy_", JoinHint.None);
					toReturn.Add(PolicyEntity.Relations.TargetEntityUsingTargetId, "Policy_", string.Empty, JoinHint.None);
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
			info.AddValue("_policy", (!this.MarkedForDeletion?_policy:null));
			info.AddValue("_alwaysFetchPolicy", _alwaysFetchPolicy);
			info.AddValue("_alreadyFetchedPolicy", _alreadyFetchedPolicy);
			info.AddValue("_libraryCollectionViaPolicy", (!this.MarkedForDeletion?_libraryCollectionViaPolicy:null));
			info.AddValue("_alwaysFetchLibraryCollectionViaPolicy", _alwaysFetchLibraryCollectionViaPolicy);
			info.AddValue("_alreadyFetchedLibraryCollectionViaPolicy", _alreadyFetchedLibraryCollectionViaPolicy);
			info.AddValue("_targetCollectionViaPolicy", (!this.MarkedForDeletion?_targetCollectionViaPolicy:null));
			info.AddValue("_alwaysFetchTargetCollectionViaPolicy", _alwaysFetchTargetCollectionViaPolicy);
			info.AddValue("_alreadyFetchedTargetCollectionViaPolicy", _alreadyFetchedTargetCollectionViaPolicy);


			
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

				case "Policy":
					_alreadyFetchedPolicy = true;
					if(entity!=null)
					{
						this.Policy.Add((PolicyEntity)entity);
					}
					break;
				case "LibraryCollectionViaPolicy":
					_alreadyFetchedLibraryCollectionViaPolicy = true;
					if(entity!=null)
					{
						this.LibraryCollectionViaPolicy.Add((LibraryEntity)entity);
					}
					break;
				case "TargetCollectionViaPolicy":
					_alreadyFetchedTargetCollectionViaPolicy = true;
					if(entity!=null)
					{
						this.TargetCollectionViaPolicy.Add((TargetEntity)entity);
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

				case "Policy":
					_policy.Add((PolicyEntity)relatedEntity);
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

				case "Policy":
					base.PerformRelatedEntityRemoval(_policy, relatedEntity, signalRelatedEntityManyToOne);
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



			return toReturn;
		}
		
		/// <summary> Gets a List of all entity collections stored as member variables in this entity. The contents of the ArrayList is
		/// used by the DataAccessAdapter to perform recursive saves. Only 1:n related collections are returned.</summary>
		/// <returns>Collection with 0 or more IEntityCollection objects, referenced by this entity</returns>
		public override List<IEntityCollection> GetMemberEntityCollections()
		{
			List<IEntityCollection> toReturn = new List<IEntityCollection>();
			toReturn.Add(_policy);

			return toReturn;
		}

		

		

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for CombineMode which data should be fetched into this CombineMode object</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id)
		{
			return FetchUsingPK(id, null, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for CombineMode which data should be fetched into this CombineMode object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			return FetchUsingPK(id, prefetchPathToUse, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for CombineMode which data should be fetched into this CombineMode object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse)
		{
			return Fetch(id, prefetchPathToUse, contextToUse, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for CombineMode which data should be fetched into this CombineMode object</param>
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
		public bool TestOriginalFieldValueForNull(CombineModeFieldIndex fieldIndex)
		{
			return base.Fields[(int)fieldIndex].IsNull;
		}
		
		/// <summary>Returns true if the current value for the field with the fieldIndex passed in represents null/not defined, false otherwise.
		/// Should not be used for testing if the original value (read from the db) is NULL</summary>
		/// <param name="fieldIndex">Index of the field to test if its currentvalue is null/undefined</param>
		/// <returns>true if the field's value isn't defined yet, false otherwise</returns>
		public bool TestCurrentFieldValueForNull(CombineModeFieldIndex fieldIndex)
		{
			return base.CheckIfCurrentFieldValueIsNull((int)fieldIndex);
		}

				
		/// <summary>Gets a list of all the EntityRelation objects the type of this instance has.</summary>
		/// <returns>A list of all the EntityRelation objects the type of this instance has. Hierarchy relations are excluded.</returns>
		public override List<IEntityRelation> GetAllRelations()
		{
			return new CombineModeRelations().GetAllRelations();
		}


		/// <summary> Retrieves all related entities of type 'PolicyEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'PolicyEntity'</returns>
		public policyDB.CollectionClasses.PolicyCollection GetMultiPolicy(bool forceFetch)
		{
			return GetMultiPolicy(forceFetch, _policy.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'PolicyEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'PolicyEntity'</returns>
		public policyDB.CollectionClasses.PolicyCollection GetMultiPolicy(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiPolicy(forceFetch, _policy.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'PolicyEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.PolicyCollection GetMultiPolicy(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiPolicy(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'PolicyEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.PolicyCollection GetMultiPolicy(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedPolicy || forceFetch || _alwaysFetchPolicy) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_policy.ParticipatesInTransaction)
					{
						base.Transaction.Add(_policy);
					}
				}
				_policy.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_policy.EntityFactoryToUse = entityFactoryToUse;
				}
				_policy.GetMultiManyToOne(this, null, null, filter);
				_policy.SuppressClearInGetMulti=false;
				_alreadyFetchedPolicy = true;
			}
			return _policy;
		}

		/// <summary> Sets the collection parameters for the collection for 'Policy'. These settings will be taken into account
		/// when the property Policy is requested or GetMultiPolicy is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersPolicy(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_policy.SortClauses=sortClauses;
			_policy.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'LibraryEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'LibraryEntity'</returns>
		public policyDB.CollectionClasses.LibraryCollection GetMultiLibraryCollectionViaPolicy(bool forceFetch)
		{
			return GetMultiLibraryCollectionViaPolicy(forceFetch, _libraryCollectionViaPolicy.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'LibraryEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.LibraryCollection GetMultiLibraryCollectionViaPolicy(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedLibraryCollectionViaPolicy || forceFetch || _alwaysFetchLibraryCollectionViaPolicy) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_libraryCollectionViaPolicy.ParticipatesInTransaction)
					{
						base.Transaction.Add(_libraryCollectionViaPolicy);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(CombineModeFields.Id, ComparisonOperator.Equal, this.Id, "CombineModeEntity__"));
				_libraryCollectionViaPolicy.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_libraryCollectionViaPolicy.EntityFactoryToUse = entityFactoryToUse;
				}
				_libraryCollectionViaPolicy.GetMulti(filter, GetRelationsForField("LibraryCollectionViaPolicy"));
				_libraryCollectionViaPolicy.SuppressClearInGetMulti=false;
				_alreadyFetchedLibraryCollectionViaPolicy = true;
			}
			return _libraryCollectionViaPolicy;
		}

		/// <summary> Sets the collection parameters for the collection for 'LibraryCollectionViaPolicy'. These settings will be taken into account
		/// when the property LibraryCollectionViaPolicy is requested or GetMultiLibraryCollectionViaPolicy is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersLibraryCollectionViaPolicy(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_libraryCollectionViaPolicy.SortClauses=sortClauses;
			_libraryCollectionViaPolicy.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'TargetEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'TargetEntity'</returns>
		public policyDB.CollectionClasses.TargetCollection GetMultiTargetCollectionViaPolicy(bool forceFetch)
		{
			return GetMultiTargetCollectionViaPolicy(forceFetch, _targetCollectionViaPolicy.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'TargetEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.TargetCollection GetMultiTargetCollectionViaPolicy(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedTargetCollectionViaPolicy || forceFetch || _alwaysFetchTargetCollectionViaPolicy) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_targetCollectionViaPolicy.ParticipatesInTransaction)
					{
						base.Transaction.Add(_targetCollectionViaPolicy);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(CombineModeFields.Id, ComparisonOperator.Equal, this.Id, "CombineModeEntity__"));
				_targetCollectionViaPolicy.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_targetCollectionViaPolicy.EntityFactoryToUse = entityFactoryToUse;
				}
				_targetCollectionViaPolicy.GetMulti(filter, GetRelationsForField("TargetCollectionViaPolicy"));
				_targetCollectionViaPolicy.SuppressClearInGetMulti=false;
				_alreadyFetchedTargetCollectionViaPolicy = true;
			}
			return _targetCollectionViaPolicy;
		}

		/// <summary> Sets the collection parameters for the collection for 'TargetCollectionViaPolicy'. These settings will be taken into account
		/// when the property TargetCollectionViaPolicy is requested or GetMultiTargetCollectionViaPolicy is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersTargetCollectionViaPolicy(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_targetCollectionViaPolicy.SortClauses=sortClauses;
			_targetCollectionViaPolicy.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}



		/// <summary> Performs the insert action of a new Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool InsertEntity()
		{
			CombineModeDAO dao = (CombineModeDAO)CreateDAOInstance();
			return dao.AddNew(base.Fields, base.Transaction);
		}
		
		/// <summary> Adds the internals to the active context. </summary>
		protected override void AddInternalsToContext()
		{
			_policy.ActiveContext = base.ActiveContext;
			_libraryCollectionViaPolicy.ActiveContext = base.ActiveContext;
			_targetCollectionViaPolicy.ActiveContext = base.ActiveContext;



		}


		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity()
		{
			CombineModeDAO dao = (CombineModeDAO)CreateDAOInstance();
			return dao.UpdateExisting(base.Fields, base.Transaction);
		}
		
		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <param name="updateRestriction">Predicate expression, meant for concurrency checks in an Update query</param>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity(IPredicate updateRestriction)
		{
			CombineModeDAO dao = (CombineModeDAO)CreateDAOInstance();
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
			return EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.CombineModeEntity);
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

			toReturn.Add("Policy", _policy);
			toReturn.Add("LibraryCollectionViaPolicy", _libraryCollectionViaPolicy);
			toReturn.Add("TargetCollectionViaPolicy", _targetCollectionViaPolicy);

			return toReturn;
		}
		

		/// <summary> Initializes the the entity and fetches the data related to the entity in this entity.</summary>
		/// <param name="id">PK value for CombineMode which data should be fetched into this CombineMode object</param>
		/// <param name="validator">The validator object for this CombineModeEntity</param>
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
			_policy = new policyDB.CollectionClasses.PolicyCollection(new PolicyEntityFactory());
			_policy.SetContainingEntityInfo(this, "CombineMode");
			_alwaysFetchPolicy = false;
			_alreadyFetchedPolicy = false;
			_libraryCollectionViaPolicy = new policyDB.CollectionClasses.LibraryCollection(new LibraryEntityFactory());
			_alwaysFetchLibraryCollectionViaPolicy = false;
			_alreadyFetchedLibraryCollectionViaPolicy = false;
			_targetCollectionViaPolicy = new policyDB.CollectionClasses.TargetCollection(new TargetEntityFactory());
			_alwaysFetchTargetCollectionViaPolicy = false;
			_alreadyFetchedTargetCollectionViaPolicy = false;



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

			_fieldsCustomProperties.Add("Name", fieldHashtable);
		}
		#endregion




		/// <summary> Fetches the entity from the persistent storage. Fetch simply reads the entity into an EntityFields object. </summary>
		/// <param name="id">PK value for CombineMode which data should be fetched into this CombineMode object</param>
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
				base.Fields[(int)CombineModeFieldIndex.Id].ForcedCurrentValueWrite(id);
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
			return DAOFactory.CreateCombineModeDAO();
		}
		
		/// <summary> Creates the entity factory for this type.</summary>
		/// <returns></returns>
		protected override IEntityFactory CreateEntityFactory()
		{
			return new CombineModeEntityFactory();
		}

		#region Class Property Declarations
		/// <summary> The relations object holding all relations of this entity with other entity classes.</summary>
		public  static CombineModeRelations Relations
		{
			get	{ return new CombineModeRelations(); }
		}
		
		/// <summary> The custom properties for this entity type.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		public  static Dictionary<string, string> CustomProperties
		{
			get { return _customProperties;}
		}


		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Policy' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathPolicy
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.PolicyCollection(),
					(IEntityRelation)GetRelationsForField("Policy")[0], (int)policyDB.EntityType.CombineModeEntity, (int)policyDB.EntityType.PolicyEntity, 0, null, null, null, "Policy", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Library' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathLibraryCollectionViaPolicy
		{
			get
			{
				IEntityRelation intermediateRelation = CombineModeEntity.Relations.PolicyEntityUsingCombineModeId;
				intermediateRelation.SetAliases(string.Empty, "Policy_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.LibraryCollection(), intermediateRelation,
					(int)policyDB.EntityType.CombineModeEntity, (int)policyDB.EntityType.LibraryEntity, 0, null, null, GetRelationsForField("LibraryCollectionViaPolicy"), "LibraryCollectionViaPolicy", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Target' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathTargetCollectionViaPolicy
		{
			get
			{
				IEntityRelation intermediateRelation = CombineModeEntity.Relations.PolicyEntityUsingCombineModeId;
				intermediateRelation.SetAliases(string.Empty, "Policy_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.TargetCollection(), intermediateRelation,
					(int)policyDB.EntityType.CombineModeEntity, (int)policyDB.EntityType.TargetEntity, 0, null, null, GetRelationsForField("TargetCollectionViaPolicy"), "TargetCollectionViaPolicy", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}



		/// <summary>Returns the full name for this entity, which is important for the DAO to find back persistence info for this entity.</summary>
		[Browsable(false), XmlIgnore]
		public override string LLBLGenProEntityName
		{
			get { return "CombineModeEntity";}
		}

		/// <summary> The custom properties for the type of this entity instance.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		[Browsable(false), XmlIgnore]
		public override Dictionary<string, string> CustomPropertiesOfType
		{
			get { return CombineModeEntity.CustomProperties;}
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
			get { return CombineModeEntity.FieldsCustomProperties;}
		}

		/// <summary> The Id property of the Entity CombineMode<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "combineMode"."id"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, true, true</remarks>
		public virtual System.Int32 Id
		{
			get { return (System.Int32)GetValue((int)CombineModeFieldIndex.Id, true); }
			set	{ SetValue((int)CombineModeFieldIndex.Id, value, true); }
		}
		/// <summary> The Name property of the Entity CombineMode<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "combineMode"."name"<br/>
		/// Table field type characteristics (type, precision, scale, length): NVarChar, 0, 0, 250<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.String Name
		{
			get { return (System.String)GetValue((int)CombineModeFieldIndex.Name, true); }
			set	{ SetValue((int)CombineModeFieldIndex.Name, value, true); }
		}

		/// <summary> Retrieves all related entities of type 'PolicyEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiPolicy()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.PolicyCollection Policy
		{
			get	{ return GetMultiPolicy(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for Policy. When set to true, Policy is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Policy is accessed. You can always execute
		/// a forced fetch by calling GetMultiPolicy(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchPolicy
		{
			get	{ return _alwaysFetchPolicy; }
			set	{ _alwaysFetchPolicy = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property Policy already has been fetched. Setting this property to false when Policy has been fetched
		/// will clear the Policy collection well. Setting this property to true while Policy hasn't been fetched disables lazy loading for Policy</summary>
		[Browsable(false)]
		public bool AlreadyFetchedPolicy
		{
			get { return _alreadyFetchedPolicy;}
			set 
			{
				if(_alreadyFetchedPolicy && !value && (_policy != null))
				{
					_policy.Clear();
				}
				_alreadyFetchedPolicy = value;
			}
		}

		/// <summary> Retrieves all related entities of type 'LibraryEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiLibraryCollectionViaPolicy()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.LibraryCollection LibraryCollectionViaPolicy
		{
			get { return GetMultiLibraryCollectionViaPolicy(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for LibraryCollectionViaPolicy. When set to true, LibraryCollectionViaPolicy is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time LibraryCollectionViaPolicy is accessed. You can always execute
		/// a forced fetch by calling GetMultiLibraryCollectionViaPolicy(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchLibraryCollectionViaPolicy
		{
			get	{ return _alwaysFetchLibraryCollectionViaPolicy; }
			set	{ _alwaysFetchLibraryCollectionViaPolicy = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property LibraryCollectionViaPolicy already has been fetched. Setting this property to false when LibraryCollectionViaPolicy has been fetched
		/// will clear the LibraryCollectionViaPolicy collection well. Setting this property to true while LibraryCollectionViaPolicy hasn't been fetched disables lazy loading for LibraryCollectionViaPolicy</summary>
		[Browsable(false)]
		public bool AlreadyFetchedLibraryCollectionViaPolicy
		{
			get { return _alreadyFetchedLibraryCollectionViaPolicy;}
			set 
			{
				if(_alreadyFetchedLibraryCollectionViaPolicy && !value && (_libraryCollectionViaPolicy != null))
				{
					_libraryCollectionViaPolicy.Clear();
				}
				_alreadyFetchedLibraryCollectionViaPolicy = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'TargetEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiTargetCollectionViaPolicy()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.TargetCollection TargetCollectionViaPolicy
		{
			get { return GetMultiTargetCollectionViaPolicy(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for TargetCollectionViaPolicy. When set to true, TargetCollectionViaPolicy is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time TargetCollectionViaPolicy is accessed. You can always execute
		/// a forced fetch by calling GetMultiTargetCollectionViaPolicy(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchTargetCollectionViaPolicy
		{
			get	{ return _alwaysFetchTargetCollectionViaPolicy; }
			set	{ _alwaysFetchTargetCollectionViaPolicy = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property TargetCollectionViaPolicy already has been fetched. Setting this property to false when TargetCollectionViaPolicy has been fetched
		/// will clear the TargetCollectionViaPolicy collection well. Setting this property to true while TargetCollectionViaPolicy hasn't been fetched disables lazy loading for TargetCollectionViaPolicy</summary>
		[Browsable(false)]
		public bool AlreadyFetchedTargetCollectionViaPolicy
		{
			get { return _alreadyFetchedTargetCollectionViaPolicy;}
			set 
			{
				if(_alreadyFetchedTargetCollectionViaPolicy && !value && (_targetCollectionViaPolicy != null))
				{
					_targetCollectionViaPolicy.Clear();
				}
				_alreadyFetchedTargetCollectionViaPolicy = value;
			}
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
			get { return (int)policyDB.EntityType.CombineModeEntity; }
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
