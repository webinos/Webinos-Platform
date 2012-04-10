///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:05
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Data;
using System.Data.Common;
using System.Collections;

using policyDB.EntityClasses;
using policyDB.FactoryClasses;
using policyDB.CollectionClasses;
using policyDB.HelperClasses;
using policyDB;

using SD.LLBLGen.Pro.ORMSupportClasses;
using SD.LLBLGen.Pro.DQE.SqlServer;


namespace policyDB.DaoClasses
{
	
	// __LLBLGENPRO_USER_CODE_REGION_START AdditionalNamespaces
	// __LLBLGENPRO_USER_CODE_REGION_END

	/// <summary>
	/// General DAO class for the Library Entity. It will perform database oriented actions for
	/// a entity of type 'LibraryEntity'. This DAO works on an EntityFields object. 
	/// </summary>
	public partial class LibraryDAO : DaoBase
	{
		/// <summary>CTor</summary>
		public LibraryDAO() : base(InheritanceInfoProviderSingleton.GetInstance(), new DynamicQueryEngine(), InheritanceHierarchyType.None, "LibraryEntity", new LibraryEntityFactory())
		{
		}
		
		/// <summary>CTor</summary>
		/// <param name="inheritanceInfoProviderToUse">Inheritance info provider to use.</param>
		/// <param name="dqeToUse">Dqe to use.</param>
		/// <param name="typeOfInheritance">Type of inheritance.</param>
		/// <param name="entityName">Name of the entity.</param>
		/// <param name="entityFactory">Entity factory.</param>
		internal LibraryDAO(IInheritanceInfoProvider inheritanceInfoProviderToUse, DynamicQueryEngineBase dqeToUse, InheritanceHierarchyType typeOfInheritance, string entityName, IEntityFactory entityFactory) : base(inheritanceInfoProviderToUse, dqeToUse, typeOfInheritance, entityName, entityFactory)
		{
		}


		/// <summary>
		/// Retrieves entities of the type 'LibraryEntity' in a datatable which match the specified filter. 
		/// It will always create a new connection to the database.
		/// </summary>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query. 
		/// If the used Dynamic Query Engine supports it, 'TOP' is used to limit the amount of rows to return. 
		/// When set to 0, no limitations are specified.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="selectFilter">A predicate or predicate expression which should be used as filter for the entities to retrieve.</param>
		/// <param name="relations">The set of relations to walk to construct to total query.</param>
		/// <param name="pageNumber">The page number to retrieve.</param>
		/// <param name="pageSize">The page size of the page to retrieve.</param>
		/// <returns>a filled datatable if succeeded, false otherwise</returns>
		public virtual DataTable GetMultiAsDataTable(long maxNumberOfItemsToReturn, ISortExpression sortClauses, IPredicate selectFilter, IRelationCollection relations, int pageNumber, int pageSize)
		{
			return base.PerformGetMultiAsDataTableAction(maxNumberOfItemsToReturn, sortClauses, selectFilter, relations, pageNumber, pageSize);
		}

	
		/// <summary>
		/// Retrieves in the calling LibraryCollection object all LibraryEntity objects
		/// which are related via a relation of type 'm:n' with the passed in CombineModeEntity. 
		/// </summary>
		/// <param name="containingTransaction">A containing transaction, if caller is added to a transaction, or null if not.</param>
		/// <param name="collectionToFill">Collection to fill with the entity objects retrieved</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query. 
		/// If the used Dynamic Query Engine supports it, 'TOP' is used to limit the amount of rows to return. When set to 0, no limitations are specified.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="entityFactoryToUse">The EntityFactory to use when creating entity objects during a GetMulti() call.</param>
		/// <param name="combineModeInstance">CombineModeEntity object to be used as a filter in the m:n relation</param>
		/// <param name="pageNumber">The page number to retrieve.</param>
		/// <param name="pageSize">The page size of the page to retrieve.</param>
		/// <returns>true if succeeded, false otherwise</returns>
		public bool GetMultiUsingCombineModeCollectionViaPolicy(ITransaction containingTransaction, IEntityCollection collectionToFill, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IEntityFactory entityFactoryToUse, IEntity combineModeInstance, int pageNumber, int pageSize)
		{
			IEntityFields fieldsToReturn = EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.LibraryEntity);
			RelationCollection relations = new RelationCollection();
			relations.Add(LibraryEntity.Relations.PolicyEntityUsingLibraryId, "Policy_");
			relations.Add(PolicyEntity.Relations.CombineModeEntityUsingCombineModeId, "Policy_", string.Empty, JoinHint.None);
			IPredicateExpression selectFilter = new PredicateExpression();
			selectFilter.Add(new FieldCompareValuePredicate(combineModeInstance.Fields[(int)CombineModeFieldIndex.Id], ComparisonOperator.Equal));
			return GetMulti(containingTransaction, collectionToFill, maxNumberOfItemsToReturn, sortClauses, entityFactoryToUse, selectFilter, relations, pageNumber, pageSize);
		}

		/// <summary>
		/// Retrieves in the calling LibraryCollection object all LibraryEntity objects
		/// which are related via a relation of type 'm:n' with the passed in CombineModeEntity. 
		/// </summary>
		/// <param name="containingTransaction">A containing transaction, if caller is added to a transaction, or null if not.</param>
		/// <param name="collectionToFill">Collection to fill with the entity objects retrieved</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query. 
		/// If the used Dynamic Query Engine supports it, 'TOP' is used to limit the amount of rows to return. When set to 0, no limitations are specified.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="entityFactoryToUse">The EntityFactory to use when creating entity objects during a GetMulti() call.</param>
		/// <param name="combineModeInstance">CombineModeEntity object to be used as a filter in the m:n relation</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch.</param>
		/// <returns>true if succeeded, false otherwise</returns>
		public bool GetMultiUsingCombineModeCollectionViaPolicy(ITransaction containingTransaction, IEntityCollection collectionToFill, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IEntityFactory entityFactoryToUse, IEntity combineModeInstance, IPrefetchPath prefetchPathToUse)
		{
			IEntityFields fieldsToReturn = EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.LibraryEntity);
			RelationCollection relations = new RelationCollection();
			relations.Add(LibraryEntity.Relations.PolicyEntityUsingLibraryId, "Policy_");
			relations.Add(PolicyEntity.Relations.CombineModeEntityUsingCombineModeId, "Policy_", string.Empty, JoinHint.None);
			IPredicateExpression selectFilter = new PredicateExpression();
			selectFilter.Add(new FieldCompareValuePredicate(combineModeInstance.Fields[(int)CombineModeFieldIndex.Id], ComparisonOperator.Equal));
			return GetMulti(containingTransaction, collectionToFill, maxNumberOfItemsToReturn, sortClauses, entityFactoryToUse, selectFilter, relations, prefetchPathToUse);
		}

		/// <summary>
		/// Retrieves in the calling LibraryCollection object all LibraryEntity objects
		/// which are related via a relation of type 'm:n' with the passed in PolicyLinkEntity. 
		/// </summary>
		/// <param name="containingTransaction">A containing transaction, if caller is added to a transaction, or null if not.</param>
		/// <param name="collectionToFill">Collection to fill with the entity objects retrieved</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query. 
		/// If the used Dynamic Query Engine supports it, 'TOP' is used to limit the amount of rows to return. When set to 0, no limitations are specified.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="entityFactoryToUse">The EntityFactory to use when creating entity objects during a GetMulti() call.</param>
		/// <param name="policyLinkInstance">PolicyLinkEntity object to be used as a filter in the m:n relation</param>
		/// <param name="pageNumber">The page number to retrieve.</param>
		/// <param name="pageSize">The page size of the page to retrieve.</param>
		/// <returns>true if succeeded, false otherwise</returns>
		public bool GetMultiUsingPolicyLinkCollectionViaPolicyDocument(ITransaction containingTransaction, IEntityCollection collectionToFill, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IEntityFactory entityFactoryToUse, IEntity policyLinkInstance, int pageNumber, int pageSize)
		{
			IEntityFields fieldsToReturn = EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.LibraryEntity);
			RelationCollection relations = new RelationCollection();
			relations.Add(LibraryEntity.Relations.PolicyDocumentEntityUsingLibraryId, "PolicyDocument_");
			relations.Add(PolicyDocumentEntity.Relations.PolicyLinkEntityUsingPolicyLinkId, "PolicyDocument_", string.Empty, JoinHint.None);
			IPredicateExpression selectFilter = new PredicateExpression();
			selectFilter.Add(new FieldCompareValuePredicate(policyLinkInstance.Fields[(int)PolicyLinkFieldIndex.Id], ComparisonOperator.Equal));
			return GetMulti(containingTransaction, collectionToFill, maxNumberOfItemsToReturn, sortClauses, entityFactoryToUse, selectFilter, relations, pageNumber, pageSize);
		}

		/// <summary>
		/// Retrieves in the calling LibraryCollection object all LibraryEntity objects
		/// which are related via a relation of type 'm:n' with the passed in PolicyLinkEntity. 
		/// </summary>
		/// <param name="containingTransaction">A containing transaction, if caller is added to a transaction, or null if not.</param>
		/// <param name="collectionToFill">Collection to fill with the entity objects retrieved</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query. 
		/// If the used Dynamic Query Engine supports it, 'TOP' is used to limit the amount of rows to return. When set to 0, no limitations are specified.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="entityFactoryToUse">The EntityFactory to use when creating entity objects during a GetMulti() call.</param>
		/// <param name="policyLinkInstance">PolicyLinkEntity object to be used as a filter in the m:n relation</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch.</param>
		/// <returns>true if succeeded, false otherwise</returns>
		public bool GetMultiUsingPolicyLinkCollectionViaPolicyDocument(ITransaction containingTransaction, IEntityCollection collectionToFill, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IEntityFactory entityFactoryToUse, IEntity policyLinkInstance, IPrefetchPath prefetchPathToUse)
		{
			IEntityFields fieldsToReturn = EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.LibraryEntity);
			RelationCollection relations = new RelationCollection();
			relations.Add(LibraryEntity.Relations.PolicyDocumentEntityUsingLibraryId, "PolicyDocument_");
			relations.Add(PolicyDocumentEntity.Relations.PolicyLinkEntityUsingPolicyLinkId, "PolicyDocument_", string.Empty, JoinHint.None);
			IPredicateExpression selectFilter = new PredicateExpression();
			selectFilter.Add(new FieldCompareValuePredicate(policyLinkInstance.Fields[(int)PolicyLinkFieldIndex.Id], ComparisonOperator.Equal));
			return GetMulti(containingTransaction, collectionToFill, maxNumberOfItemsToReturn, sortClauses, entityFactoryToUse, selectFilter, relations, prefetchPathToUse);
		}

		/// <summary>
		/// Retrieves in the calling LibraryCollection object all LibraryEntity objects
		/// which are related via a relation of type 'm:n' with the passed in TargetEntity. 
		/// </summary>
		/// <param name="containingTransaction">A containing transaction, if caller is added to a transaction, or null if not.</param>
		/// <param name="collectionToFill">Collection to fill with the entity objects retrieved</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query. 
		/// If the used Dynamic Query Engine supports it, 'TOP' is used to limit the amount of rows to return. When set to 0, no limitations are specified.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="entityFactoryToUse">The EntityFactory to use when creating entity objects during a GetMulti() call.</param>
		/// <param name="targetInstance">TargetEntity object to be used as a filter in the m:n relation</param>
		/// <param name="pageNumber">The page number to retrieve.</param>
		/// <param name="pageSize">The page size of the page to retrieve.</param>
		/// <returns>true if succeeded, false otherwise</returns>
		public bool GetMultiUsingTargetCollectionViaPolicy(ITransaction containingTransaction, IEntityCollection collectionToFill, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IEntityFactory entityFactoryToUse, IEntity targetInstance, int pageNumber, int pageSize)
		{
			IEntityFields fieldsToReturn = EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.LibraryEntity);
			RelationCollection relations = new RelationCollection();
			relations.Add(LibraryEntity.Relations.PolicyEntityUsingLibraryId, "Policy_");
			relations.Add(PolicyEntity.Relations.TargetEntityUsingTargetId, "Policy_", string.Empty, JoinHint.None);
			IPredicateExpression selectFilter = new PredicateExpression();
			selectFilter.Add(new FieldCompareValuePredicate(targetInstance.Fields[(int)TargetFieldIndex.Id], ComparisonOperator.Equal));
			return GetMulti(containingTransaction, collectionToFill, maxNumberOfItemsToReturn, sortClauses, entityFactoryToUse, selectFilter, relations, pageNumber, pageSize);
		}

		/// <summary>
		/// Retrieves in the calling LibraryCollection object all LibraryEntity objects
		/// which are related via a relation of type 'm:n' with the passed in TargetEntity. 
		/// </summary>
		/// <param name="containingTransaction">A containing transaction, if caller is added to a transaction, or null if not.</param>
		/// <param name="collectionToFill">Collection to fill with the entity objects retrieved</param>
		/// <param name="maxNumberOfItemsToReturn"> The maximum number of items to return with this retrieval query. 
		/// If the used Dynamic Query Engine supports it, 'TOP' is used to limit the amount of rows to return. When set to 0, no limitations are specified.</param>
		/// <param name="sortClauses">The order by specifications for the sorting of the resultset. When not specified, no sorting is applied.</param>
		/// <param name="entityFactoryToUse">The EntityFactory to use when creating entity objects during a GetMulti() call.</param>
		/// <param name="targetInstance">TargetEntity object to be used as a filter in the m:n relation</param>
		/// <param name="prefetchPathToUse">the PrefetchPath which defines the graph of objects to fetch.</param>
		/// <returns>true if succeeded, false otherwise</returns>
		public bool GetMultiUsingTargetCollectionViaPolicy(ITransaction containingTransaction, IEntityCollection collectionToFill, long maxNumberOfItemsToReturn, ISortExpression sortClauses, IEntityFactory entityFactoryToUse, IEntity targetInstance, IPrefetchPath prefetchPathToUse)
		{
			IEntityFields fieldsToReturn = EntityFieldsFactory.CreateEntityFieldsObject(policyDB.EntityType.LibraryEntity);
			RelationCollection relations = new RelationCollection();
			relations.Add(LibraryEntity.Relations.PolicyEntityUsingLibraryId, "Policy_");
			relations.Add(PolicyEntity.Relations.TargetEntityUsingTargetId, "Policy_", string.Empty, JoinHint.None);
			IPredicateExpression selectFilter = new PredicateExpression();
			selectFilter.Add(new FieldCompareValuePredicate(targetInstance.Fields[(int)TargetFieldIndex.Id], ComparisonOperator.Equal));
			return GetMulti(containingTransaction, collectionToFill, maxNumberOfItemsToReturn, sortClauses, entityFactoryToUse, selectFilter, relations, prefetchPathToUse);
		}

	

		/// <summary>
		/// Determines the connection to use. If transaction to use is null, a new connection is created, otherwise the connection of the transaction is used.
		/// </summary>
		/// <param name="transactionToUse">Transaction to use.</param>
		/// <returns>a ready to use connection object.</returns>
		protected override IDbConnection DetermineConnectionToUse(ITransaction transactionToUse)
		{
			return DbUtils.DetermineConnectionToUse(transactionToUse);
		}
		
		/// <summary>
		/// Creates a new ADO.NET data adapter.
		/// </summary>
		/// <returns>ready to use ADO.NET data-adapter</returns>
		protected override DbDataAdapter CreateDataAdapter()
		{
			return DbUtils.CreateDataAdapter();
		}


		#region Custom DAO code
		
		// __LLBLGENPRO_USER_CODE_REGION_START CustomDAOCode
		// __LLBLGENPRO_USER_CODE_REGION_END
		#endregion
		
		#region Included Code

		#endregion
	}
}
