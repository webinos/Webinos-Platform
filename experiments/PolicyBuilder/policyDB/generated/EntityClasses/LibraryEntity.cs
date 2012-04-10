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
	/// Entity class which represents the entity 'Library'. <br/><br/>
	/// 
	/// </summary>
	[Serializable]
	public partial class LibraryEntity : CommonEntityBase, ISerializable
		// __LLBLGENPRO_USER_CODE_REGION_START AdditionalInterfaces
		// __LLBLGENPRO_USER_CODE_REGION_END	
	{
		#region Class Member Declarations
		private policyDB.CollectionClasses.PolicyCollection	_policy;
		private bool	_alwaysFetchPolicy, _alreadyFetchedPolicy;
		private policyDB.CollectionClasses.PolicyDocumentCollection	_policyDocument;
		private bool	_alwaysFetchPolicyDocument, _alreadyFetchedPolicyDocument;
		private policyDB.CollectionClasses.QueryCollection	_query;
		private bool	_alwaysFetchQuery, _alreadyFetchedQuery;
		private policyDB.CollectionClasses.CombineModeCollection _combineModeCollectionViaPolicy;
		private bool	_alwaysFetchCombineModeCollectionViaPolicy, _alreadyFetchedCombineModeCollectionViaPolicy;
		private policyDB.CollectionClasses.PolicyLinkCollection _policyLinkCollectionViaPolicyDocument;
		private bool	_alwaysFetchPolicyLinkCollectionViaPolicyDocument, _alreadyFetchedPolicyLinkCollectionViaPolicyDocument;
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
			/// <summary>Member name PolicyDocument</summary>
			public static readonly string PolicyDocument = "PolicyDocument";
			/// <summary>Member name Query</summary>
			public static readonly string Query = "Query";
			/// <summary>Member name CombineModeCollectionViaPolicy</summary>
			public static readonly string CombineModeCollectionViaPolicy = "CombineModeCollectionViaPolicy";
			/// <summary>Member name PolicyLinkCollectionViaPolicyDocument</summary>
			public static readonly string PolicyLinkCollectionViaPolicyDocument = "PolicyLinkCollectionViaPolicyDocument";
			/// <summary>Member name TargetCollectionViaPolicy</summary>
			public static readonly string TargetCollectionViaPolicy = "TargetCollectionViaPolicy";

		}
		#endregion
		
		/// <summary>Static CTor for setting up custom property hashtables. Is executed before the first instance of this entity class or derived classes is constructed. </summary>
		static LibraryEntity()
		{
			SetupCustomPropertyHashtables();
		}

		/// <summary>CTor</summary>
		public LibraryEntity()
		{
			InitClassEmpty(null);
		}


		/// <summary>CTor</summary>
		/// <param name="id">PK value for Library which data should be fetched into this Library object</param>
		public LibraryEntity(System.Int32 id)
		{
			InitClassFetch(id, null, null);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for Library which data should be fetched into this Library object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		public LibraryEntity(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			InitClassFetch(id, null, prefetchPathToUse);
		}

		/// <summary>CTor</summary>
		/// <param name="id">PK value for Library which data should be fetched into this Library object</param>
		/// <param name="validator">The custom validator object for this LibraryEntity</param>
		public LibraryEntity(System.Int32 id, IValidator validator)
		{
			InitClassFetch(id, validator, null);
		}


		/// <summary>Private CTor for deserialization</summary>
		/// <param name="info"></param>
		/// <param name="context"></param>
		protected LibraryEntity(SerializationInfo info, StreamingContext context) : base(info, context)
		{
			_policy = (policyDB.CollectionClasses.PolicyCollection)info.GetValue("_policy", typeof(policyDB.CollectionClasses.PolicyCollection));
			_alwaysFetchPolicy = info.GetBoolean("_alwaysFetchPolicy");
			_alreadyFetchedPolicy = info.GetBoolean("_alreadyFetchedPolicy");
			_policyDocument = (policyDB.CollectionClasses.PolicyDocumentCollection)info.GetValue("_policyDocument", typeof(policyDB.CollectionClasses.PolicyDocumentCollection));
			_alwaysFetchPolicyDocument = info.GetBoolean("_alwaysFetchPolicyDocument");
			_alreadyFetchedPolicyDocument = info.GetBoolean("_alreadyFetchedPolicyDocument");
			_query = (policyDB.CollectionClasses.QueryCollection)info.GetValue("_query", typeof(policyDB.CollectionClasses.QueryCollection));
			_alwaysFetchQuery = info.GetBoolean("_alwaysFetchQuery");
			_alreadyFetchedQuery = info.GetBoolean("_alreadyFetchedQuery");
			_combineModeCollectionViaPolicy = (policyDB.CollectionClasses.CombineModeCollection)info.GetValue("_combineModeCollectionViaPolicy", typeof(policyDB.CollectionClasses.CombineModeCollection));
			_alwaysFetchCombineModeCollectionViaPolicy = info.GetBoolean("_alwaysFetchCombineModeCollectionViaPolicy");
			_alreadyFetchedCombineModeCollectionViaPolicy = info.GetBoolean("_alreadyFetchedCombineModeCollectionViaPolicy");
			_policyLinkCollectionViaPolicyDocument = (policyDB.CollectionClasses.PolicyLinkCollection)info.GetValue("_policyLinkCollectionViaPolicyDocument", typeof(policyDB.CollectionClasses.PolicyLinkCollection));
			_alwaysFetchPolicyLinkCollectionViaPolicyDocument = info.GetBoolean("_alwaysFetchPolicyLinkCollectionViaPolicyDocument");
			_alreadyFetchedPolicyLinkCollectionViaPolicyDocument = info.GetBoolean("_alreadyFetchedPolicyLinkCollectionViaPolicyDocument");
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
			switch((LibraryFieldIndex)fieldIndex)
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
			_alreadyFetchedPolicyDocument = (_policyDocument.Count > 0);
			_alreadyFetchedQuery = (_query.Count > 0);
			_alreadyFetchedCombineModeCollectionViaPolicy = (_combineModeCollectionViaPolicy.Count > 0);
			_alreadyFetchedPolicyLinkCollectionViaPolicyDocument = (_policyLinkCollectionViaPolicyDocument.Count > 0);
			_alreadyFetchedTargetCollectionViaPolicy = (_targetCollectionViaPolicy.Count > 0);


		}
				
		/// <summary>Gets the relation objects which represent the relation the fieldName specified is mapped on. </summary>
		/// <param name="fieldName">Name of the field mapped onto the relation of which the relation objects have to be obtained.</param>
		/// <returns>RelationCollection with relation object(s) which represent the relation the field is maped on</returns>
		public override RelationCollection GetRelationsForFieldOfType(string fieldName)
		{
			return LibraryEntity.GetRelationsForField(fieldName);
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
					toReturn.Add(LibraryEntity.Relations.PolicyEntityUsingLibraryId);
					break;
				case "PolicyDocument":
					toReturn.Add(LibraryEntity.Relations.PolicyDocumentEntityUsingLibraryId);
					break;
				case "Query":
					toReturn.Add(LibraryEntity.Relations.QueryEntityUsingLibraryId);
					break;
				case "CombineModeCollectionViaPolicy":
					toReturn.Add(LibraryEntity.Relations.PolicyEntityUsingLibraryId, "LibraryEntity__", "Policy_", JoinHint.None);
					toReturn.Add(PolicyEntity.Relations.CombineModeEntityUsingCombineModeId, "Policy_", string.Empty, JoinHint.None);
					break;
				case "PolicyLinkCollectionViaPolicyDocument":
					toReturn.Add(LibraryEntity.Relations.PolicyDocumentEntityUsingLibraryId, "LibraryEntity__", "PolicyDocument_", JoinHint.None);
					toReturn.Add(PolicyDocumentEntity.Relations.PolicyLinkEntityUsingPolicyLinkId, "PolicyDocument_", string.Empty, JoinHint.None);
					break;
				case "TargetCollectionViaPolicy":
					toReturn.Add(LibraryEntity.Relations.PolicyEntityUsingLibraryId, "LibraryEntity__", "Policy_", JoinHint.None);
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
			info.AddValue("_policyDocument", (!this.MarkedForDeletion?_policyDocument:null));
			info.AddValue("_alwaysFetchPolicyDocument", _alwaysFetchPolicyDocument);
			info.AddValue("_alreadyFetchedPolicyDocument", _alreadyFetchedPolicyDocument);
			info.AddValue("_query", (!this.MarkedForDeletion?_query:null));
			info.AddValue("_alwaysFetchQuery", _alwaysFetchQuery);
			info.AddValue("_alreadyFetchedQuery", _alreadyFetchedQuery);
			info.AddValue("_combineModeCollectionViaPolicy", (!this.MarkedForDeletion?_combineModeCollectionViaPolicy:null));
			info.AddValue("_alwaysFetchCombineModeCollectionViaPolicy", _alwaysFetchCombineModeCollectionViaPolicy);
			info.AddValue("_alreadyFetchedCombineModeCollectionViaPolicy", _alreadyFetchedCombineModeCollectionViaPolicy);
			info.AddValue("_policyLinkCollectionViaPolicyDocument", (!this.MarkedForDeletion?_policyLinkCollectionViaPolicyDocument:null));
			info.AddValue("_alwaysFetchPolicyLinkCollectionViaPolicyDocument", _alwaysFetchPolicyLinkCollectionViaPolicyDocument);
			info.AddValue("_alreadyFetchedPolicyLinkCollectionViaPolicyDocument", _alreadyFetchedPolicyLinkCollectionViaPolicyDocument);
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
				case "PolicyDocument":
					_alreadyFetchedPolicyDocument = true;
					if(entity!=null)
					{
						this.PolicyDocument.Add((PolicyDocumentEntity)entity);
					}
					break;
				case "Query":
					_alreadyFetchedQuery = true;
					if(entity!=null)
					{
						this.Query.Add((QueryEntity)entity);
					}
					break;
				case "CombineModeCollectionViaPolicy":
					_alreadyFetchedCombineModeCollectionViaPolicy = true;
					if(entity!=null)
					{
						this.CombineModeCollectionViaPolicy.Add((CombineModeEntity)entity);
					}
					break;
				case "PolicyLinkCollectionViaPolicyDocument":
					_alreadyFetchedPolicyLinkCollectionViaPolicyDocument = true;
					if(entity!=null)
					{
						this.PolicyLinkCollectionViaPolicyDocument.Add((PolicyLinkEntity)entity);
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
				case "PolicyDocument":
					_policyDocument.Add((PolicyDocumentEntity)relatedEntity);
					break;
				case "Query":
					_query.Add((QueryEntity)relatedEntity);
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
				case "PolicyDocument":
					base.PerformRelatedEntityRemoval(_policyDocument, relatedEntity, signalRelatedEntityManyToOne);
					break;
				case "Query":
					base.PerformRelatedEntityRemoval(_query, relatedEntity, signalRelatedEntityManyToOne);
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
			toReturn.Add(_policyDocument);
			toReturn.Add(_query);

			return toReturn;
		}

		

		

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Library which data should be fetched into this Library object</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id)
		{
			return FetchUsingPK(id, null, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Library which data should be fetched into this Library object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse)
		{
			return FetchUsingPK(id, prefetchPathToUse, null, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Library which data should be fetched into this Library object</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch as well</param>
		/// <param name="contextToUse">The context to add the entity to if the fetch was succesful. </param>
		/// <returns>True if succeeded, false otherwise.</returns>
		public bool FetchUsingPK(System.Int32 id, IPrefetchPath prefetchPathToUse, Context contextToUse)
		{
			return Fetch(id, prefetchPathToUse, contextToUse, null);
		}

		/// <summary> Fetches the contents of this entity from the persistent storage using the primary key.</summary>
		/// <param name="id">PK value for Library which data should be fetched into this Library object</param>
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
		public bool TestOriginalFieldValueForNull(LibraryFieldIndex fieldIndex)
		{
			return base.Fields[(int)fieldIndex].IsNull;
		}
		
		/// <summary>Returns true if the current value for the field with the fieldIndex passed in represents null/not defined, false otherwise.
		/// Should not be used for testing if the original value (read from the db) is NULL</summary>
		/// <param name="fieldIndex">Index of the field to test if its currentvalue is null/undefined</param>
		/// <returns>true if the field's value isn't defined yet, false otherwise</returns>
		public bool TestCurrentFieldValueForNull(LibraryFieldIndex fieldIndex)
		{
			return base.CheckIfCurrentFieldValueIsNull((int)fieldIndex);
		}

				
		/// <summary>Gets a list of all the EntityRelation objects the type of this instance has.</summary>
		/// <returns>A list of all the EntityRelation objects the type of this instance has. Hierarchy relations are excluded.</returns>
		public override List<IEntityRelation> GetAllRelations()
		{
			return new LibraryRelations().GetAllRelations();
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
				_policy.GetMultiManyToOne(null, this, null, filter);
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

		/// <summary> Retrieves all related entities of type 'PolicyDocumentEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'PolicyDocumentEntity'</returns>
		public policyDB.CollectionClasses.PolicyDocumentCollection GetMultiPolicyDocument(bool forceFetch)
		{
			return GetMultiPolicyDocument(forceFetch, _policyDocument.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'PolicyDocumentEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'PolicyDocumentEntity'</returns>
		public policyDB.CollectionClasses.PolicyDocumentCollection GetMultiPolicyDocument(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiPolicyDocument(forceFetch, _policyDocument.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'PolicyDocumentEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.PolicyDocumentCollection GetMultiPolicyDocument(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiPolicyDocument(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'PolicyDocumentEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.PolicyDocumentCollection GetMultiPolicyDocument(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedPolicyDocument || forceFetch || _alwaysFetchPolicyDocument) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_policyDocument.ParticipatesInTransaction)
					{
						base.Transaction.Add(_policyDocument);
					}
				}
				_policyDocument.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_policyDocument.EntityFactoryToUse = entityFactoryToUse;
				}
				_policyDocument.GetMultiManyToOne(this, null, filter);
				_policyDocument.SuppressClearInGetMulti=false;
				_alreadyFetchedPolicyDocument = true;
			}
			return _policyDocument;
		}

		/// <summary> Sets the collection parameters for the collection for 'PolicyDocument'. These settings will be taken into account
		/// when the property PolicyDocument is requested or GetMultiPolicyDocument is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersPolicyDocument(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_policyDocument.SortClauses=sortClauses;
			_policyDocument.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'QueryEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'QueryEntity'</returns>
		public policyDB.CollectionClasses.QueryCollection GetMultiQuery(bool forceFetch)
		{
			return GetMultiQuery(forceFetch, _query.EntityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'QueryEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of type 'QueryEntity'</returns>
		public policyDB.CollectionClasses.QueryCollection GetMultiQuery(bool forceFetch, IPredicateExpression filter)
		{
			return GetMultiQuery(forceFetch, _query.EntityFactoryToUse, filter);
		}

		/// <summary> Retrieves all related entities of type 'QueryEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.QueryCollection GetMultiQuery(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
			return GetMultiQuery(forceFetch, entityFactoryToUse, null);
		}

		/// <summary> Retrieves all related entities of type 'QueryEntity' using a relation of type '1:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToOne() routine.</param>
		/// <param name="filter">Extra filter to limit the resultset.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public virtual policyDB.CollectionClasses.QueryCollection GetMultiQuery(bool forceFetch, IEntityFactory entityFactoryToUse, IPredicateExpression filter)
		{
 			if( ( !_alreadyFetchedQuery || forceFetch || _alwaysFetchQuery) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_query.ParticipatesInTransaction)
					{
						base.Transaction.Add(_query);
					}
				}
				_query.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_query.EntityFactoryToUse = entityFactoryToUse;
				}
				_query.GetMultiManyToOne(this, filter);
				_query.SuppressClearInGetMulti=false;
				_alreadyFetchedQuery = true;
			}
			return _query;
		}

		/// <summary> Sets the collection parameters for the collection for 'Query'. These settings will be taken into account
		/// when the property Query is requested or GetMultiQuery is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersQuery(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_query.SortClauses=sortClauses;
			_query.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'CombineModeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'CombineModeEntity'</returns>
		public policyDB.CollectionClasses.CombineModeCollection GetMultiCombineModeCollectionViaPolicy(bool forceFetch)
		{
			return GetMultiCombineModeCollectionViaPolicy(forceFetch, _combineModeCollectionViaPolicy.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'CombineModeEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.CombineModeCollection GetMultiCombineModeCollectionViaPolicy(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedCombineModeCollectionViaPolicy || forceFetch || _alwaysFetchCombineModeCollectionViaPolicy) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_combineModeCollectionViaPolicy.ParticipatesInTransaction)
					{
						base.Transaction.Add(_combineModeCollectionViaPolicy);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(LibraryFields.Id, ComparisonOperator.Equal, this.Id, "LibraryEntity__"));
				_combineModeCollectionViaPolicy.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_combineModeCollectionViaPolicy.EntityFactoryToUse = entityFactoryToUse;
				}
				_combineModeCollectionViaPolicy.GetMulti(filter, GetRelationsForField("CombineModeCollectionViaPolicy"));
				_combineModeCollectionViaPolicy.SuppressClearInGetMulti=false;
				_alreadyFetchedCombineModeCollectionViaPolicy = true;
			}
			return _combineModeCollectionViaPolicy;
		}

		/// <summary> Sets the collection parameters for the collection for 'CombineModeCollectionViaPolicy'. These settings will be taken into account
		/// when the property CombineModeCollectionViaPolicy is requested or GetMultiCombineModeCollectionViaPolicy is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersCombineModeCollectionViaPolicy(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_combineModeCollectionViaPolicy.SortClauses=sortClauses;
			_combineModeCollectionViaPolicy.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
		}

		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <returns>Filled collection with all related entities of type 'PolicyLinkEntity'</returns>
		public policyDB.CollectionClasses.PolicyLinkCollection GetMultiPolicyLinkCollectionViaPolicyDocument(bool forceFetch)
		{
			return GetMultiPolicyLinkCollectionViaPolicyDocument(forceFetch, _policyLinkCollectionViaPolicyDocument.EntityFactoryToUse);
		}

		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type 'm:n'.</summary>
		/// <param name="forceFetch">if true, it will discard any changes currently in the collection and will rerun the complete query instead</param>
		/// <param name="entityFactoryToUse">The entity factory to use for the GetMultiManyToMany() routine.</param>
		/// <returns>Filled collection with all related entities of the type constructed by the passed in entity factory</returns>
		public policyDB.CollectionClasses.PolicyLinkCollection GetMultiPolicyLinkCollectionViaPolicyDocument(bool forceFetch, IEntityFactory entityFactoryToUse)
		{
 			if( ( !_alreadyFetchedPolicyLinkCollectionViaPolicyDocument || forceFetch || _alwaysFetchPolicyLinkCollectionViaPolicyDocument) && !base.IsSerializing && !base.IsDeserializing && !base.InDesignMode)
			{
				if(base.ParticipatesInTransaction)
				{
					if(!_policyLinkCollectionViaPolicyDocument.ParticipatesInTransaction)
					{
						base.Transaction.Add(_policyLinkCollectionViaPolicyDocument);
					}
				}
				IPredicateExpression filter = new PredicateExpression();
				filter.Add(new FieldCompareValuePredicate(LibraryFields.Id, ComparisonOperator.Equal, this.Id, "LibraryEntity__"));
				_policyLinkCollectionViaPolicyDocument.SuppressClearInGetMulti=!forceFetch;
				if(entityFactoryToUse!=null)
				{
					_policyLinkCollectionViaPolicyDocument.EntityFactoryToUse = entityFactoryToUse;
				}
				_policyLinkCollectionViaPolicyDocument.GetMulti(filter, GetRelationsForField("PolicyLinkCollectionViaPolicyDocument"));
				_policyLinkCollectionViaPolicyDocument.SuppressClearInGetMulti=false;
				_alreadyFetchedPolicyLinkCollectionViaPolicyDocument = true;
			}
			return _policyLinkCollectionViaPolicyDocument;
		}

		/// <summary> Sets the collection parameters for the collection for 'PolicyLinkCollectionViaPolicyDocument'. These settings will be taken into account
		/// when the property PolicyLinkCollectionViaPolicyDocument is requested or GetMultiPolicyLinkCollectionViaPolicyDocument is called.</summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return. When set to 0, this parameter is ignored</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified (null), no sorting is applied.</param>
		public virtual void SetCollectionParametersPolicyLinkCollectionViaPolicyDocument(long maxNumberOfItemsToReturn, ISortExpression sortClauses)
		{
			_policyLinkCollectionViaPolicyDocument.SortClauses=sortClauses;
			_policyLinkCollectionViaPolicyDocument.MaxNumberOfItemsToReturn=maxNumberOfItemsToReturn;
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
				filter.Add(new FieldCompareValuePredicate(LibraryFields.Id, ComparisonOperator.Equal, this.Id, "LibraryEntity__"));
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
			LibraryDAO dao = (LibraryDAO)CreateDAOInstance();
			return dao.AddNew(base.Fields, base.Transaction);
		}
		
		/// <summary> Adds the internals to the active context. </summary>
		protected override void AddInternalsToContext()
		{
			_policy.ActiveContext = base.ActiveContext;
			_policyDocument.ActiveContext = base.ActiveContext;
			_query.ActiveContext = base.ActiveContext;
			_combineModeCollectionViaPolicy.ActiveContext = base.ActiveContext;
			_policyLinkCollectionViaPolicyDocument.ActiveContext = base.ActiveContext;
			_targetCollectionViaPolicy.ActiveContext = base.ActiveContext;



		}


		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity()
		{
			LibraryDAO dao = (LibraryDAO)CreateDAOInstance();
			return dao.UpdateExisting(base.Fields, base.Transaction);
		}
		
		/// <summary> Performs the update action of an existing Entity to the persistent storage.</summary>
		/// <param name="updateRestriction">Predicate expression, meant for concurrency checks in an Update query</param>
		/// <returns>true if succeeded, false otherwise</returns>
		protected override bool UpdateEntity(IPredicate updateRestriction)
		{
			LibraryDAO dao = (LibraryDAO)CreateDAOInstance();
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
			return EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.LibraryEntity);
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
			toReturn.Add("PolicyDocument", _policyDocument);
			toReturn.Add("Query", _query);
			toReturn.Add("CombineModeCollectionViaPolicy", _combineModeCollectionViaPolicy);
			toReturn.Add("PolicyLinkCollectionViaPolicyDocument", _policyLinkCollectionViaPolicyDocument);
			toReturn.Add("TargetCollectionViaPolicy", _targetCollectionViaPolicy);

			return toReturn;
		}
		

		/// <summary> Initializes the the entity and fetches the data related to the entity in this entity.</summary>
		/// <param name="id">PK value for Library which data should be fetched into this Library object</param>
		/// <param name="validator">The validator object for this LibraryEntity</param>
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
			_policy.SetContainingEntityInfo(this, "Library");
			_alwaysFetchPolicy = false;
			_alreadyFetchedPolicy = false;
			_policyDocument = new policyDB.CollectionClasses.PolicyDocumentCollection(new PolicyDocumentEntityFactory());
			_policyDocument.SetContainingEntityInfo(this, "Library");
			_alwaysFetchPolicyDocument = false;
			_alreadyFetchedPolicyDocument = false;
			_query = new policyDB.CollectionClasses.QueryCollection(new QueryEntityFactory());
			_query.SetContainingEntityInfo(this, "Library");
			_alwaysFetchQuery = false;
			_alreadyFetchedQuery = false;
			_combineModeCollectionViaPolicy = new policyDB.CollectionClasses.CombineModeCollection(new CombineModeEntityFactory());
			_alwaysFetchCombineModeCollectionViaPolicy = false;
			_alreadyFetchedCombineModeCollectionViaPolicy = false;
			_policyLinkCollectionViaPolicyDocument = new policyDB.CollectionClasses.PolicyLinkCollection(new PolicyLinkEntityFactory());
			_alwaysFetchPolicyLinkCollectionViaPolicyDocument = false;
			_alreadyFetchedPolicyLinkCollectionViaPolicyDocument = false;
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
			fieldHashtable = new Dictionary<string, string>();

			_fieldsCustomProperties.Add("Locked", fieldHashtable);
		}
		#endregion




		/// <summary> Fetches the entity from the persistent storage. Fetch simply reads the entity into an EntityFields object. </summary>
		/// <param name="id">PK value for Library which data should be fetched into this Library object</param>
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
				base.Fields[(int)LibraryFieldIndex.Id].ForcedCurrentValueWrite(id);
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
			return DAOFactory.CreateLibraryDAO();
		}
		
		/// <summary> Creates the entity factory for this type.</summary>
		/// <returns></returns>
		protected override IEntityFactory CreateEntityFactory()
		{
			return new LibraryEntityFactory();
		}

		#region Class Property Declarations
		/// <summary> The relations object holding all relations of this entity with other entity classes.</summary>
		public  static LibraryRelations Relations
		{
			get	{ return new LibraryRelations(); }
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
					(IEntityRelation)GetRelationsForField("Policy")[0], (int)policyDB.EntityType.LibraryEntity, (int)policyDB.EntityType.PolicyEntity, 0, null, null, null, "Policy", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'PolicyDocument' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathPolicyDocument
		{
			get
			{
				return new PrefetchPathElement(new policyDB.CollectionClasses.PolicyDocumentCollection(),
					(IEntityRelation)GetRelationsForField("PolicyDocument")[0], (int)policyDB.EntityType.LibraryEntity, (int)policyDB.EntityType.PolicyDocumentEntity, 0, null, null, null, "PolicyDocument", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
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
					(IEntityRelation)GetRelationsForField("Query")[0], (int)policyDB.EntityType.LibraryEntity, (int)policyDB.EntityType.QueryEntity, 0, null, null, null, "Query", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'CombineMode' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathCombineModeCollectionViaPolicy
		{
			get
			{
				IEntityRelation intermediateRelation = LibraryEntity.Relations.PolicyEntityUsingLibraryId;
				intermediateRelation.SetAliases(string.Empty, "Policy_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.CombineModeCollection(), intermediateRelation,
					(int)policyDB.EntityType.LibraryEntity, (int)policyDB.EntityType.CombineModeEntity, 0, null, null, GetRelationsForField("CombineModeCollectionViaPolicy"), "CombineModeCollectionViaPolicy", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'PolicyLink' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathPolicyLinkCollectionViaPolicyDocument
		{
			get
			{
				IEntityRelation intermediateRelation = LibraryEntity.Relations.PolicyDocumentEntityUsingLibraryId;
				intermediateRelation.SetAliases(string.Empty, "PolicyDocument_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.PolicyLinkCollection(), intermediateRelation,
					(int)policyDB.EntityType.LibraryEntity, (int)policyDB.EntityType.PolicyLinkEntity, 0, null, null, GetRelationsForField("PolicyLinkCollectionViaPolicyDocument"), "PolicyLinkCollectionViaPolicyDocument", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}

		/// <summary> Creates a new PrefetchPathElement object which contains all the information to prefetch the related entities of type 'Target' 
		/// for this entity. Add the object returned by this property to an existing PrefetchPath instance.</summary>
		/// <returns>Ready to use IPrefetchPathElement implementation.</returns>
		public static IPrefetchPathElement PrefetchPathTargetCollectionViaPolicy
		{
			get
			{
				IEntityRelation intermediateRelation = LibraryEntity.Relations.PolicyEntityUsingLibraryId;
				intermediateRelation.SetAliases(string.Empty, "Policy_");
				return new PrefetchPathElement(new policyDB.CollectionClasses.TargetCollection(), intermediateRelation,
					(int)policyDB.EntityType.LibraryEntity, (int)policyDB.EntityType.TargetEntity, 0, null, null, GetRelationsForField("TargetCollectionViaPolicy"), "TargetCollectionViaPolicy", SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToMany);
			}
		}



		/// <summary>Returns the full name for this entity, which is important for the DAO to find back persistence info for this entity.</summary>
		[Browsable(false), XmlIgnore]
		public override string LLBLGenProEntityName
		{
			get { return "LibraryEntity";}
		}

		/// <summary> The custom properties for the type of this entity instance.</summary>
		/// <remarks>The data returned from this property should be considered read-only: it is not thread safe to alter this data at runtime.</remarks>
		[Browsable(false), XmlIgnore]
		public override Dictionary<string, string> CustomPropertiesOfType
		{
			get { return LibraryEntity.CustomProperties;}
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
			get { return LibraryEntity.FieldsCustomProperties;}
		}

		/// <summary> The Id property of the Entity Library<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "library"."id"<br/>
		/// Table field type characteristics (type, precision, scale, length): Int, 10, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, true, true</remarks>
		public virtual System.Int32 Id
		{
			get { return (System.Int32)GetValue((int)LibraryFieldIndex.Id, true); }
			set	{ SetValue((int)LibraryFieldIndex.Id, value, true); }
		}
		/// <summary> The Name property of the Entity Library<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "library"."name"<br/>
		/// Table field type characteristics (type, precision, scale, length): NVarChar, 0, 0, 500<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.String Name
		{
			get { return (System.String)GetValue((int)LibraryFieldIndex.Name, true); }
			set	{ SetValue((int)LibraryFieldIndex.Name, value, true); }
		}
		/// <summary> The Locked property of the Entity Library<br/><br/>
		/// </summary>
		/// <remarks>Mapped on  table field: "library"."locked"<br/>
		/// Table field type characteristics (type, precision, scale, length): Bit, 1, 0, 0<br/>
		/// Table field behavior characteristics (is nullable, is PK, is identity): false, false, false</remarks>
		public virtual System.Boolean Locked
		{
			get { return (System.Boolean)GetValue((int)LibraryFieldIndex.Locked, true); }
			set	{ SetValue((int)LibraryFieldIndex.Locked, value, true); }
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
		/// <summary> Retrieves all related entities of type 'PolicyDocumentEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiPolicyDocument()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.PolicyDocumentCollection PolicyDocument
		{
			get	{ return GetMultiPolicyDocument(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for PolicyDocument. When set to true, PolicyDocument is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time PolicyDocument is accessed. You can always execute
		/// a forced fetch by calling GetMultiPolicyDocument(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchPolicyDocument
		{
			get	{ return _alwaysFetchPolicyDocument; }
			set	{ _alwaysFetchPolicyDocument = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property PolicyDocument already has been fetched. Setting this property to false when PolicyDocument has been fetched
		/// will clear the PolicyDocument collection well. Setting this property to true while PolicyDocument hasn't been fetched disables lazy loading for PolicyDocument</summary>
		[Browsable(false)]
		public bool AlreadyFetchedPolicyDocument
		{
			get { return _alreadyFetchedPolicyDocument;}
			set 
			{
				if(_alreadyFetchedPolicyDocument && !value && (_policyDocument != null))
				{
					_policyDocument.Clear();
				}
				_alreadyFetchedPolicyDocument = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'QueryEntity' using a relation of type '1:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiQuery()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.QueryCollection Query
		{
			get	{ return GetMultiQuery(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for Query. When set to true, Query is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time Query is accessed. You can always execute
		/// a forced fetch by calling GetMultiQuery(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchQuery
		{
			get	{ return _alwaysFetchQuery; }
			set	{ _alwaysFetchQuery = value; }	
		}		
				
		/// <summary>Gets / Sets the lazy loading flag if the property Query already has been fetched. Setting this property to false when Query has been fetched
		/// will clear the Query collection well. Setting this property to true while Query hasn't been fetched disables lazy loading for Query</summary>
		[Browsable(false)]
		public bool AlreadyFetchedQuery
		{
			get { return _alreadyFetchedQuery;}
			set 
			{
				if(_alreadyFetchedQuery && !value && (_query != null))
				{
					_query.Clear();
				}
				_alreadyFetchedQuery = value;
			}
		}

		/// <summary> Retrieves all related entities of type 'CombineModeEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiCombineModeCollectionViaPolicy()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.CombineModeCollection CombineModeCollectionViaPolicy
		{
			get { return GetMultiCombineModeCollectionViaPolicy(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for CombineModeCollectionViaPolicy. When set to true, CombineModeCollectionViaPolicy is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time CombineModeCollectionViaPolicy is accessed. You can always execute
		/// a forced fetch by calling GetMultiCombineModeCollectionViaPolicy(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchCombineModeCollectionViaPolicy
		{
			get	{ return _alwaysFetchCombineModeCollectionViaPolicy; }
			set	{ _alwaysFetchCombineModeCollectionViaPolicy = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property CombineModeCollectionViaPolicy already has been fetched. Setting this property to false when CombineModeCollectionViaPolicy has been fetched
		/// will clear the CombineModeCollectionViaPolicy collection well. Setting this property to true while CombineModeCollectionViaPolicy hasn't been fetched disables lazy loading for CombineModeCollectionViaPolicy</summary>
		[Browsable(false)]
		public bool AlreadyFetchedCombineModeCollectionViaPolicy
		{
			get { return _alreadyFetchedCombineModeCollectionViaPolicy;}
			set 
			{
				if(_alreadyFetchedCombineModeCollectionViaPolicy && !value && (_combineModeCollectionViaPolicy != null))
				{
					_combineModeCollectionViaPolicy.Clear();
				}
				_alreadyFetchedCombineModeCollectionViaPolicy = value;
			}
		}
		/// <summary> Retrieves all related entities of type 'PolicyLinkEntity' using a relation of type 'm:n'.</summary>
		/// <remarks>This property is added for databinding conveniance, however it is recommeded to use the method 'GetMultiPolicyLinkCollectionViaPolicyDocument()', because 
		/// this property is rather expensive and a method tells the user to cache the result when it has to be used more than once in the same scope.</remarks>
		public virtual policyDB.CollectionClasses.PolicyLinkCollection PolicyLinkCollectionViaPolicyDocument
		{
			get { return GetMultiPolicyLinkCollectionViaPolicyDocument(false); }
		}

		/// <summary> Gets / sets the lazy loading flag for PolicyLinkCollectionViaPolicyDocument. When set to true, PolicyLinkCollectionViaPolicyDocument is always refetched from the 
		/// persistent storage. When set to false, the data is only fetched the first time PolicyLinkCollectionViaPolicyDocument is accessed. You can always execute
		/// a forced fetch by calling GetMultiPolicyLinkCollectionViaPolicyDocument(true).</summary>
		[Browsable(false)]
		public bool AlwaysFetchPolicyLinkCollectionViaPolicyDocument
		{
			get	{ return _alwaysFetchPolicyLinkCollectionViaPolicyDocument; }
			set	{ _alwaysFetchPolicyLinkCollectionViaPolicyDocument = value; }
		}
				
		/// <summary>Gets / Sets the lazy loading flag if the property PolicyLinkCollectionViaPolicyDocument already has been fetched. Setting this property to false when PolicyLinkCollectionViaPolicyDocument has been fetched
		/// will clear the PolicyLinkCollectionViaPolicyDocument collection well. Setting this property to true while PolicyLinkCollectionViaPolicyDocument hasn't been fetched disables lazy loading for PolicyLinkCollectionViaPolicyDocument</summary>
		[Browsable(false)]
		public bool AlreadyFetchedPolicyLinkCollectionViaPolicyDocument
		{
			get { return _alreadyFetchedPolicyLinkCollectionViaPolicyDocument;}
			set 
			{
				if(_alreadyFetchedPolicyLinkCollectionViaPolicyDocument && !value && (_policyLinkCollectionViaPolicyDocument != null))
				{
					_policyLinkCollectionViaPolicyDocument.Clear();
				}
				_alreadyFetchedPolicyLinkCollectionViaPolicyDocument = value;
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
			get { return (int)policyDB.EntityType.LibraryEntity; }
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
