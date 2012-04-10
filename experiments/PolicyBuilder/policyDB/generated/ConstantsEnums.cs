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

namespace policyDB
{

	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: Attribute.
	/// </summary>
	public enum AttributeFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>AttributeTypeId. </summary>
		AttributeTypeId,
		///<summary>Name. </summary>
		Name,
		///<summary>ContextId. </summary>
		ContextId,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: AttributeType.
	/// </summary>
	public enum AttributeTypeFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>Name. </summary>
		Name,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: AttributeValue.
	/// </summary>
	public enum AttributeValueFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>AttributeMatchId. </summary>
		AttributeMatchId,
		///<summary>AttributeId. </summary>
		AttributeId,
		///<summary>Value. </summary>
		Value,
		///<summary>Literal. </summary>
		Literal,
		///<summary>Order. </summary>
		Order,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: CombineMode.
	/// </summary>
	public enum CombineModeFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>Name. </summary>
		Name,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: Context.
	/// </summary>
	public enum ContextFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>Name. </summary>
		Name,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: DecisionNode.
	/// </summary>
	public enum DecisionNodeFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>ParentId. </summary>
		ParentId,
		///<summary>Type. </summary>
		Type,
		///<summary>CombineAnd. </summary>
		CombineAnd,
		///<summary>AttributeId. </summary>
		AttributeId,
		///<summary>Extra. </summary>
		Extra,
		///<summary>Order. </summary>
		Order,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: Effect.
	/// </summary>
	public enum EffectFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>Name. </summary>
		Name,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: Library.
	/// </summary>
	public enum LibraryFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>Name. </summary>
		Name,
		///<summary>Locked. </summary>
		Locked,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: Policy.
	/// </summary>
	public enum PolicyFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>LibraryId. </summary>
		LibraryId,
		///<summary>Uid. </summary>
		Uid,
		///<summary>Description. </summary>
		Description,
		///<summary>TargetId. </summary>
		TargetId,
		///<summary>CombineModeId. </summary>
		CombineModeId,
		///<summary>Set. </summary>
		Set,
		///<summary>IsLibrary. </summary>
		IsLibrary,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: PolicyDocument.
	/// </summary>
	public enum PolicyDocumentFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>LibraryId. </summary>
		LibraryId,
		///<summary>Name. </summary>
		Name,
		///<summary>PolicyLinkId. </summary>
		PolicyLinkId,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: PolicyLink.
	/// </summary>
	public enum PolicyLinkFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>PolicyId. </summary>
		PolicyId,
		///<summary>ParentId. </summary>
		ParentId,
		///<summary>Order. </summary>
		Order,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: Query.
	/// </summary>
	public enum QueryFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>LibraryId. </summary>
		LibraryId,
		///<summary>Description. </summary>
		Description,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: QueryValue.
	/// </summary>
	public enum QueryValueFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>QueryId. </summary>
		QueryId,
		///<summary>AttributeId. </summary>
		AttributeId,
		///<summary>Extra. </summary>
		Extra,
		///<summary>Value. </summary>
		Value,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: Rule.
	/// </summary>
	public enum RuleFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>PolicyId. </summary>
		PolicyId,
		///<summary>EffectId. </summary>
		EffectId,
		///<summary>ConditionId. </summary>
		ConditionId,
		///<summary>Order. </summary>
		Order,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: Target.
	/// </summary>
	public enum TargetFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>Description. </summary>
		Description,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: TargetCondition.
	/// </summary>
	public enum TargetConditionFieldIndex:int
	{
		///<summary>TargetId. </summary>
		TargetId,
		///<summary>ConditionId. </summary>
		ConditionId,
		/// <summary></summary>
		AmountOfFields
	}


	/// <summary>
	/// Index enum to fast-access EntityFields in the IEntityFields collection for the entity: UriComponent.
	/// </summary>
	public enum UriComponentFieldIndex:int
	{
		///<summary>Id. </summary>
		Id,
		///<summary>Name. </summary>
		Name,
		/// <summary></summary>
		AmountOfFields
	}





	/// <summary>
	/// Enum definition for all the entity types defined in this namespace. Used by the entityfields factory.
	/// </summary>
	public enum EntityType:int
	{
		///<summary>Attribute</summary>
		AttributeEntity,
		///<summary>AttributeType</summary>
		AttributeTypeEntity,
		///<summary>AttributeValue</summary>
		AttributeValueEntity,
		///<summary>CombineMode</summary>
		CombineModeEntity,
		///<summary>Context</summary>
		ContextEntity,
		///<summary>DecisionNode</summary>
		DecisionNodeEntity,
		///<summary>Effect</summary>
		EffectEntity,
		///<summary>Library</summary>
		LibraryEntity,
		///<summary>Policy</summary>
		PolicyEntity,
		///<summary>PolicyDocument</summary>
		PolicyDocumentEntity,
		///<summary>PolicyLink</summary>
		PolicyLinkEntity,
		///<summary>Query</summary>
		QueryEntity,
		///<summary>QueryValue</summary>
		QueryValueEntity,
		///<summary>Rule</summary>
		RuleEntity,
		///<summary>Target</summary>
		TargetEntity,
		///<summary>TargetCondition</summary>
		TargetConditionEntity,
		///<summary>UriComponent</summary>
		UriComponentEntity
	}




	#region Custom ConstantsEnums Code
	
	// __LLBLGENPRO_USER_CODE_REGION_START CustomUserConstants
	// __LLBLGENPRO_USER_CODE_REGION_END
	#endregion

	#region Included code

	#endregion
}


